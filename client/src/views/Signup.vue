<script>/* eslint linebreak-style: ["error", "windows"] */</script>
<template>
  <div id="signup" class="container" @submit.prevent="onClickSubmit">
    <div v-if="errorMessage" class="alert alert-dismissible alert-danger mt-4">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <strong>Error!</strong> {{ errorMessage }}
  </div>
    <div v-if="loading">
      <p>Loading...</p>
    </div>
    <form v-else>
      <div class="form-group">
        <label for="username">Username</label>
        <input v-model="user.username"
        type="text" class="form-control" id="username" aria-describedby="usernameHelp"
          placeholder="Enter username">
        <small id="usernameHelp" class="form-text text-muted">
          Your username must be between 3 and 50 characters. It must be without whitespace and only
          accepts alphanumeric characters or digits.</small>
      </div>
      <div class="form-group">
        <label for="password1">Password</label>
        <input v-model="user.password1"
        type="password" class="form-control" id="password1" placeholder="Password"
        aria-describedby="passwordHelp">
        <small id="passwordHelp" class="form-text text-muted">
          Your password must be at least 6 characters and not contain whitespace.</small>
      </div>
      <div class="form-group">
        <label for="password2">Confirm password</label>
        <input v-model="user.password2"
        type="password" class="form-control" id="password2" placeholder="Confirm password">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
  const API_URL = 'http://192.168.2.44:1234';
  const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
  const passwordRegex = /^[^\s]{6,}$/;
  export default {
    data: () => ({
      errorMessage: '',
      loading: false,
      user: {
        username: '',
        password1: '',
        password2: '',
      }
    }),
    methods: {
      onClickSubmit() {
        this.errorMessage = "";
        const user = this.user;
        const username = user.username.toString().trim();
        const password1 = user.password1.toString().trim();
        const password2 = user.password2.toString().trim();

        if(!username || !password1 || !password2) {
          this.errorMessage = "Please fill out all the fields";
        }
        else if( password1 !== password2) {
          this.errorMessage = "Your passwords do not match";
        }
        else if(!usernameRegex.test(username)) {
          this.errorMessage = "Your username is not valid";
        }
        else if(!passwordRegex.test(password1)) {
          this.errorMessage = "Your password is not valid";
        }
        else {
          this.loading = true;

          const body = {
            user_name: username,
            user_password: password1,
          }
          console.log(body);

          //All looks to be valid
          fetch(SIGNUP_URL + '/user/signup', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'content-type': 'application/json',
            },
          })
          .then((response) => {
            console.log(response);
            if(response.ok) {
              return response.json();
            }
            return response.json().then((error) => {
              console.log(error);
              throw new Error(error.message);
            });
          })
          .then((result) => {
              console.log(result);
              //Signed up
              this.loading = false;
              this.$router.push('/home');
          })
          .catch((error) => {
            this.errorMessage = error.message;
            console.log(error.message);

            this.loading = false;
          });
        }
      },
    },
  }

</script>

<style>

</style>
