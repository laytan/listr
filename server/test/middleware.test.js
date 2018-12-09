const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const app = require("../index");

chai.use(chaiHttp);

const jwt = require("jsonwebtoken");

const middleware = require("../middleware");

const mockAuthorizedRequest = {
  user: {}
};

describe("Middleware", () => {
  describe("isAuthorized", () => {
    it("Returns 401 status on an unauthorized request", done => {
      middleware.isAuthorized(
        {},
        {
          status: status => {
            expect(status).to.equal(401);
            done();
          }
        },
        error => {}
      );
    });

    it("Returns an Error with unauthorized in it on a unauthorized request", done => {
      middleware.isAuthorized(
        {},
        {
          status: status => {}
        },
        error => {
          expect(error).to.be.an("Error");
          expect(error.message.toLowerCase()).to.include("unauthorized");
          done();
        }
      );
    });

    it("Calls next with no parameters on an authorized request", done => {
      middleware.isAuthorized(mockAuthorizedRequest, {}, error => {
        expect(error).to.be.undefined;
        done();
      });
    });
  });

  describe("ifTokenSetUser", () => {
    it("Does not do anything if no auth token is set", done => {
      middleware.ifTokenSetUser(
        (req = { get: () => {}, user: null }),
        {},
        error => {
          expect(error).to.be.undefined;
          expect(req.user).to.be.null;
          done();
        }
      );
    });

    it("Does not set user on invalid token", done => {
      middleware.ifTokenSetUser(
        (req = {
          get: what => {
            if (what == "authorization") {
              return "adawffew3242";
            } else return null;
          },
          user: null
        }),
        {},
        error => {
          expect(error).to.be.undefined;
          expect(req.user).to.be.null;
          done();
        }
      );
    });

    it("Sets req.user if a token is valid", done => {
      const payload = {
        user_name: "testtesttest",
        user_id: "1"
      };
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "10s" });

      middleware.ifTokenSetUser(
        (req = {
          get: what => {
            if (what == "authorization") {
              return "Bearer " + token;
            } else return null;
          },
          user: null
        }),
        {},
        error => {
          expect(error).to.be.undefined;
          expect(req.user.user_id).to.equal("1");
          expect(req.user.user_name).to.equal("testtesttest");
          done();
        }
      );
    });
  });
});
