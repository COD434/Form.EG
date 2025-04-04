const {expect} = require("chai");
const sinon = require("sinon");
const whitelistController = require("../Controllers/whitelistController");
const dynamicWhiteList = require("../Controllers/whitelistController");


describe("Whitelist Controller",()=>{
    afterEach(()=>{
        sinon.restore();
    })
});

describe("addIP",()=>{
    it("should add an IP to whitelist",async()=>{
        const req = {body: {ip: "192.168.1.1"}};
        const res = {json: sinon.spy(), status:sinon.stub().returnsThis()};

      sinon.stub(dynamicWhiteList,"addIP").resolves(true);

        await whitelistController.addIP(req,res);

        expect(res.json.calledWith({message: "IP 192.168.1.1 added to whitelist"}))
    

    })
});

describe("removeIP",()=>{
    it("should remove an IP from whitelist",async()=>{
        const req = {body:{ip:"192.168.1.1"}};
        const res= {json:sinon.spy(), status:sinon.stub().returnsThis()};

        sinon.stub(dynamicWhiteList,"removeIP").resolves(true);

        await whitelistController.removeIP(req,res);

        expect(res.json.calledWith({message:"IP 192.168.1.1 removed from whitelist"}))
    })
})

describe("listIP",()=>{
    it("should list all whitelisted IPs",async()=>{
const req ={};
const res = {json:sinon.spy(),status:sinon.stub().returnsThis()}

const mockIPs = ["192.168.1.1","10.0.0.1"];

sinon.stub(dynamicWhiteList,"listIP").resolves(mockIPs);

await whitelistController.listIP(req,res);

expect(res.json.calledWith({whitelisted_ips:mockIPs}))
    })
})