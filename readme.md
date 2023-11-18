npm init (likho taaki node_modules aur package.json, etc. saari files create ho jaaye)
npm i express (likho taaki express server install ho jaaye)
npm i mongoose (likho taaki mongoose abstraction layer hai NoSQL (mongoDB) ke liye vo install ho jaaye)
index.js banao ek, jo entry point hogi poori application ki
mongoDB pe jaana, usko connect karna (matlab chalu karna)
phir db.js karke ek file banana jo mongoose se connect karegi apne express server ko
ab index.js me jaake jo connectToMongoose wala function hai, usko import karo
npm i -D nodemon karo taaki nodemon install ho jaaye, (nodemon bole to jab bhi tu koi change karega to autorefresh hojaayega)
ab express.js pe jaao aur boiler plate code leke aao
models banane ke liye models naam ka folder banalo
ab models ke liye ye dekho ki mongoDB ke models kese bante hai express me
models banane ke baad ek routes naam ka folder banao aur saare routes usme daalo
req.body (matlab request ki body me kya data aaraha hai) usko nikalna hai to middleware ko use karna padega jiska naam hai app.use(express.json()), isko index.js me likhna (aur api hit karte time content-type: application/json rakhna)
ab express validator install karo kyunki hume data ko validate karna hai
ab password ko encrypt karna hai isliye bcryptjs install karo
AB THODI SI TERMINOLOGIES SAMAJH LETE HAI:
hash -> One way function matlab, 123 ka hash aksdjkajdkadjsadajdkahdjakd ye hota hai, lekin aksdjkajdkadjsadajdkahdjakd ka matlab zaruri nahi, matlab in a nutshell a to b jaa sakte
ab jsonwebtoken install karo, kyunki apne ko token bhejna hai bande ko authenticate karne ke liye
ab user ki id, us jwt.sign() wale function me pass karo JWT_SIGNATURE ke saath , phir user ko dedo response me token
phir, ek middleware banao jo har baar authenticate karega user, kul mila ke jo kaam tu django permission_classes = [IsAuthenticated] karke karta tha, ab tu uska logic likhega
