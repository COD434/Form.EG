const {dynamicWhiteList} = require("../prisma/config/security");

const whitelistController = {
    addIP:async (req,res)=>{
        try{
            const{ip} = req.body;
            if(!ip)return res.status(400).json({error:"IP address require"});

            await dynamicWhiteList.addIP(ip);
            res.json({message:`IP ${ip} added to whitelist`});
        }catch(err){
            res.status(500).json({error:err.message})
        }
    },
    removeIP:async(req,res)=>{
        try{
            const {ip}=req.body;
            if(!ip)return res.status(400).json({error:"IP address required"});

            await dynamicWhiteList.removeIP(ip);
            res.json({message:`IP ${ip} removed from whitelist`})
        }catch(err){
            res.status(500).json({error:err.message});
        }
    },
    listIP:async(req,res)=>{
        try{
            const ips = await dynamicWhiteList.listIP();
            res.json({whitelisted_ips:ips});
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
}
module.exports= whitelistController;