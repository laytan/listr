const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const app = require("../index");

chai.use(chaiHttp);

process.env.TEST = true;

describe("GET: /", () => {
  it("Passes an empty test", () => {});

  it("Returns an 200 status", done => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it("Returns a welcome message", done => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res.body.message.toLowerCase()).to.include("welcome");
        done();
      });
  });
});
