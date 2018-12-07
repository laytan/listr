<script>/* eslint linebreak-style: ["error", "windows"] */</script>
<template>
  <div id="login" class="container" @submit.prevent="onClickSubmit">
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
        type="text" class="form-control" id="username"
          placeholder="Enter username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="user.password"
        type="password" class="form-control" id="password" placeholder="Password">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
const API_URL = 'http://localhost:1234';
const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
const passwordRegex = /^[^\s]{6,}$/;
export default {
    data: () => ({
        errorMessage: '',
        loading: false,
        user: {
            username: '',
            password: '',
        }
    }),
    methods: {
        onClickSubmit() {
            this.errorMessage = "";
            const user = this.user;
            const username = user.username.toString().trim();
            const password = user.password.toString().trim();

            if(!username || !password) {
                this.errorMessage = "Please fill out all the fields";
            }
            else if(!usernameRegex.test(username)) {
                this.errorMessage = "Invalid credentials";
            }
            else if(!passwordRegex.test(password)) {
                this.errorMessage = "Invalid credentials";
            }
            else {
               //All looks to be valid
                const body = {
                    user_name: username,
                    user_password: password
                };
                this.loading = true;
                fetch(API_URL + '/user/login', {
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
                    localStorage.token = result.token;
                    this.loading = false;
                    this.$router.push('/dashboard');
                })
                .catch((error) => {
                    this.loading = false;
                    this.errorMessage = error.message;
                });
            }
        }
    }
}
</script>

<style>

</style>
