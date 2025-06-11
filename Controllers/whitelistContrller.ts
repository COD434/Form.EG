import {dynamicWhiteList} from "../prisma/config/security";
import {Request, Response, NextFunction} from "express";

export const adminController = {
    addIP:async (req:Request,res:Response):Promise<void> => {
        try{
            const{ip,ttl} = req.body;
            if(!ip){
	 res.status(400).json({error:"IP address require"});
	 return;   
	    }

            await dynamicWhiteList.addIP(ip,ttl);
            res.json({message:`IP ${ip} added to whitelist`});
        }catch(err){
		if(err instanceof Error){
            res.status(500).json({error:err.message})
		}
        }
    },
    removeIP:async(req: Request,res:Response):Promise<void> => {
        try{
            const {ip}=req.body;
            if(!ip){
	res.status(400).json({error:"IP address required"});
	return
	    }
            await dynamicWhiteList.removeIP(ip);
            res.json({message:`IP ${ip} removed from whitelist`})
        }catch(err){
		if(err instanceof Error){
            res.status(500).json({error:err.message});
        }
      } 
    },
    listIP:async(req:Request,res:Response):Promise<void> => {
        try{
            const ips = await dynamicWhiteList.listIP();
            res.json({whitelisted_ips:ips});
        }catch(err){
		if(err instanceof Error){
            res.status(500).json({error:err.message})
        }
    }
 }
}
