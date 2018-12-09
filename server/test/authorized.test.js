const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const app = require("../index");

chai.use(chaiHttp);

const jwt = require("jsonwebtoken");

describe("GET: /authorized/verify", () => {
  it("Returns a 401 if auth token is not set", done => {
    chai
      .request(app)
      .get("/authorized/verify")
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it("Returns a message if auth token is not set", done => {
    chai
      .request(app)
      .get("/authorized/verify")
      .end((err, res) => {
        expect(res.body.message.toLowerCase()).to.include("unauthorized");
        done();
      });
  });

  it("Returns the deconstructed auth token if set", done => {
    const payload = {
      user_id: "1",
      user_name: "test"
    };
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "1s"
    });

    chai
      .request(app)
      .get("/authorized/verify")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        expect(res.body.id).to.equal("1");
        expect(res.body.username).to.equal("test");
        done();
      });
  });

  it("Returns a 401 when an invalid auth token is sent", done => {
    chai
      .request(app)
      .get("/authorized/verify")
      .set("authorization", "Bearer awregwdfawerwef")
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it("Returns a unauthorized message when an invalid token is sent", done => {
    chai
      .request(app)
      .get("/authorized/verify")
      .set("authorization", "Bearer sdfadsdf323")
      .end((err, res) => {
        expect(res.body.message.toLowerCase()).to.include("unauthorized");
        done();
      });
  });
});
