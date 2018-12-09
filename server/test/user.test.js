const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const app = require("../index");

chai.use(chaiHttp);

const db = require("../database/connection");

describe("POST: /user/signup", () => {
  const user = {
    user_name: "testtesttest",
    user_password: "1234567890"
  };

  const userNoUserName = {
    user_password: "1234567890",
    only_validate: true
  };

  const userNoUserPassword = {
    user_name: "testtesttest",
    only_validate: true
  };

  const userUserNameSpaces = {
    user_name: "              ",
    user_password: "123456890",
    only_validate: true
  };

  const userUserPasswordSpacec = {
    user_password: "              ",
    user_password: "123456890",
    only_validate: true
  };

  const userUserNameInvalidWithSpace = {
    user_name: "testtest test",
    user_password: "123456890",
    only_validate: true
  };

  const userUserNameInvalidWithCharacters = {
    user_name: "testtest_*",
    user_password: "123456890",
    only_validate: true
  };

  const userUserNameToShort = {
    user_name: "aa",
    user_password: "123456890",
    only_validate: true
  };

  const userUserNameToLong = {
    user_name: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTAAAAA",
    user_password: "123456890",
    only_validate: true
  };

  const userPasswordToLong = {
    user_name: "testtesttest",
    user_password:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST",
    only_validate: true
  };

  const userPasswordInvalidWithSpace = {
    user_name: "testtesttest",
    user_password: "12332423 234",
    only_validate: true
  };

  const userPasswordToShort = {
    user_name: "testtesttest",
    user_password: "12331",
    only_validate: true
  };

  it("Returns a 422 and not valid message when the username contains whitespace", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserNameInvalidWithSpace)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the username contains invalid characters", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserNameInvalidWithCharacters)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the username is too short", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserNameToShort)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the username is too long", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserNameToLong)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the password is too long", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userPasswordToLong)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the password contains a space", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userPasswordInvalidWithSpace)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the password is too short", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userPasswordToShort)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the username only has spaces", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserNameSpaces)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when the password only has spaces", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userUserPasswordSpacec)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when no body is sent", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send({})
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when no user_name is sent", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userNoUserName)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 422 and not valid message when no user_password is sent", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(userNoUserPassword)
      .end((err, res) => {
        expect(res.body.message).to.include("not valid");
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("Returns a 409 and username in use message when a user_name is already taken", done => {
    chai
      .request(app)
      .post("/user/signup")
      .send(user)
      .end((err, res) => {
        expect(res.body.message.toLowerCase()).to.include("username");
        expect(res.status).to.equal(409);
        done();
      });
  });

  it("Returns a token when the signup is valid and succesfull", done => {
    db.queryPromise(
      "DELETE FROM user WHERE user_name = ?",
      user.user_name
    ).then(response => {
      chai
        .request(app)
        .post("/user/signup")
        .send(user)
        .end((err, res) => {
          expect(res.body.token).to.be.an("string");
          done();
        });
    });
  });
});
