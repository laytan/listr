<script>
/* eslint linebreak-style: ["error", "windows"] */
</script>
<template>
  <div id="dashboard" class="container">
    <div v-if="errorMessage" class="alert alert-dismissible alert-danger my-3">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <strong>Error!</strong> {{ errorMessage }}
    </div>
    <div v-if="succesMessage" class="alert alert-dismissible alert-success my-3">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <strong>Succes!</strong> {{ succesMessage }}
    </div>
    <div id="list-modal" class="modal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add a new list</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="title">Title</label>
                <input type="text" v-model="newList.title" required class="form-control" id="title"
                placeholder="Title">
              </div>
              <div class="form-group">
                <label for="description">description</label>
                <textarea class="form-control" v-model="newList.description"
                id="description" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="submit" @click="addList" class="btn btn-primary">Add</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <h1 class="my-3">{{ user.username }}'s listss</h1>
    <button type="button" class="btn btn-warning" @click="logout">Log out</button>
    <button type="button" class="btn btn-succes" data-toggle="modal" data-target="#list-modal"
      @click="listModal = true">Add a list</button>
    <p v-if="loading">Loading...</p>
    <div v-for="list in lists" :key="list.list_id" class="card my-3">
      <div class="card-body">
        <h4 class="card-title">{{ list.title }}</h4>
        <h6 class="card-subtitle mb-2 text-muted">
          {{ list.list_id }}
        </h6>
        <p class="card-text">{{ list.description }}</p>

        <div class="list-group">
          <a v-for="item in list.items" :key="item.id" href="#"
          class="list-group-item list-group-item-action">
            {{ item.text }}
          </a>
        </div>

        <button type="button" class="btn btn-outline-danger"
         @click="removeList(list.list_id)">Remove
          list</button>
      </div>
    </div>
  </div>
</template>

<script>
  const GET_ALL_LISTS_URL = 'http://localhost:1234/authorized/lists/full';
  const VERIFY_URL = 'http://localhost:1234/authorized/verify';
  const REMOVE_LIST_URL = 'http://localhost:1234/authorized/lists/remove';
  const ADD_LIST_URL = 'http://localhost:1234/authorized/lists/create';
  export default {
    data: () => ({
      user: {},
      lists: {},
      errorMessage: '',
      succesMessage: '',
      loading: false,
      newList: {
        title: '',
        description: '',
      },
    }),
    mounted() {
      this.loading = true;
      fetch(VERIFY_URL, {
          headers: {
            authorization: `Bearer ${localStorage.token}`,
          },
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return response.json().then((error) => {
            throw new Error("Unauthorized request");
          });
        })
        .then((user) => {
          this.user = user;
          this.loading = false;
          this.getLists();
        })
        .catch((error) => {
          this.loading = false;
          setTimeout(() => {
            this.logout();
          }, 2000);
        });
    },
    methods: {
      addList() {
        this.errorMessage = '';
        this.succesMessage = '';
        $('#list-modal').modal('hide');
        if(!this.newList.title) this.errorMessage = "Please fill out the title.";
        else this.succesMessage = "In the works!";
      },
      getLists() {
        this.loading = true;
        this.errorMessage = '';
        fetch(GET_ALL_LISTS_URL, {
            headers: {
              authorization: `Bearer ${localStorage.token}`,
            },
          })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then((error) => {
              throw new Error("Internal server error");
            });
          })
          .then((lists) => {
            this.lists = lists;
            this.loading = false;
          })
          .catch((err) => {
            this.errorMessage = err.message;
            this.loading = false;
          });
      },
      logout() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      },
      removeList(listId) {
        this.errorMessage = '';
        console.log(listId);
        const body = {
          "list_id": listId,
        }
        this.loading = true;
        fetch(REMOVE_LIST_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${localStorage.token}`,
            },
          })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then((error) => {
              throw new Error("Internal server error");
            });
          })
          .then(() => {
            this.loading = false;
            this.succesMessage = "Succesfully removed!";
            setTimeout(() => {
              this.succesMessage = '';
            }, 2000);
          })
          .catch((error) => {
            this.errorMessage = error.message;
            this.loading = false;
          });
      },
    },
  };

</script>

<style>

</style>
