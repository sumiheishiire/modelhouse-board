/* gviz.csv(スプレッドシートのCSV) -> 個人情報を除いた data.json。毎朝GitHub Actionsが実行 */
const fs = require("fs");
function parseCsv(text){
  const rows=[];let f="",row=[],q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else{if(c==='"')q=true;else if(c===','){row.push(f);f="";}
      else if(c==='\n'){row.push(f);rows.push(row);row=[];f="";}
      else if(c==='\r'){}else f+=c;}}
  if(f.length||row.length){row.push(f);rows.push(row);}
  return rows;
}
const CITY_RE=/^(長野市|中野市|飯山市|須坂市|小布施町|高山村|上田市|山ノ内町|千曲市|坂城町|信濃町|飯綱町|小川村|栄村|木島平村|野沢温泉村|松本市|諏訪市|飯田市|東御市|佐久市|安曇野市)/;
const WD=["日","月","火","水","木","金","土"];
const BUILDERS=["矢嶋建築","冨岡建設","土屋建設","田中建築","村山建設","須坂土建"];
function cityOf(a){ if(!a)return ""; const m=a.match(CITY_RE); return m?m[1]:a.slice(0,3); }
function classifyRel(flag,note){
  if(!flag) return "実顧客";
  const n=note||"";
  if(/契約済/.test(n)) return "契約済み";
  if(/家族|親族/.test(n)) return "ご家族";
  if(/\(株\)|㈱|メーカー|YKK|四国化成|タカラ|パナソニック|ハウジング/.test(n)) return "メーカー・仕入先";
  if(/銀行|ローン|不動産|長電/.test(n)) return "金融・不動産";
  if(/設計|デザイン/.test(n)) return "設計事務所";
  if(/大工|建築業|職人/.test(n)) return "同業・職人";
  if(/知り合い|知人|紹介/.test(n)) return "知人紹介";
  if(/宛先|住所/.test(n)) return "住所不備";
  return "その他関係者";
}
function isDate(s){ return /^\s*(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/.test(s||""); }
function dowOf(s,dow){ if(dow)return dow; const m=(s||"").match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/); if(!m)return""; return WD[new Date(+m[1],+m[2]-1,+m[3]).getDay()]; }

const rows = parseCsv(fs.readFileSync(process.argv[2]||"gviz.csv","utf8"));
const safe = rows.filter(r=> r.length>3 && isDate(r[0]) && ((r[2]||"").trim()||(r[3]||"").trim()))
  .map(r=>{
    const g=i=>(r[i]==null?"":String(r[i])).trim();
    const flag=g(4)==="1";
    const tour=[]; for(let i=16;i<=21;i++){ if(g(i)) tour.push(BUILDERS[i-16]); }
    const b2raw=g(23);
    const best2=b2raw?b2raw.split(/[、,\/／・]/).map(s=>s.trim()).filter(Boolean):[];
    return {
      d:g(0), w:dowOf(g(0),g(1)), ct:cityOf(g(9)), cu:flag?0:1, rl:classifyRel(flag,g(5)),
      k:g(12), j:g(14), y:g(15), n:g(28), k1:g(22), k2:best2[0]||"", so:g(25), t:tour, b2:best2
    };
  });

if(safe.length < 100) { console.error("rows too few: "+safe.length); process.exit(1); }
const jst = new Date(Date.now()+9*3600*1000).toISOString().replace("T"," ").slice(0,16);
fs.writeFileSync("data.json", JSON.stringify({updated: jst+" JST", rows: safe}));
console.log("rows="+safe.length+" last="+safe[safe.length-1].d);
