<script>
/* eslint linebreak-style: ["error", "windows"] */
</script>
<template>
  <div id="dashboard" class="container">
    <div v-if="errorMessage.length > 1" class="alert alert-dismissible alert-danger my-3">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <strong>Error!</strong> {{ errorMessage }}
    </div>
    <div v-if="succesMessage.length > 1" class="alert alert-dismissible alert-success my-3">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <strong>Succes!</strong> {{ succesMessage }}
    </div>
    <div id="list-modal" class="modal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add a list</h5>
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
    <div id="list-item-modal" class="modal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add an item</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="text">Text</label>
                <input type="text" v-model="newListItem.text" required
                class="form-control" id="text"
                placeholder="Text">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="submit" @click="addListItem" class="btn btn-primary">Add</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <h1 class="my-3">{{ user.username }}'s listss</h1>
    <button type="button" class="btn btn-warning" @click="logout">Log out</button>
    <button type="button" class="btn btn-success" data-toggle="modal" data-target="#list-modal"
    >Add a list</button>
    <p v-if="loading">Loading...</p>
    <div v-for="(list, index) in lists" :key="list.list_id" class="card my-3">
      <div class="card-body">
        <h4 class="card-title">{{ list.title }}</h4>
        <h6 class="card-subtitle mb-2 text-muted">
        </h6>
        <p class="card-text">{{ list.description }}</p>

        <div class="list-group">
          <div v-for="item in list.items" :key="item.list_item_id"
          class="list-group-item list-group-item-action">
            {{ item.list_item_text }}
            <button type="button" class="close" aria-label="Remove">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        <button type="button" class="btn btn-success" data-toggle="modal"
        data-target="#list-item-modal" @click="onClickAddListItem(list.list_id, index)"
        >Add item</button>
        <button type="button" class="btn btn-outline-danger"
         @click="removeList(list.list_id, index)">Remove
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
  const ADD_LIST_ITEM_URL = 'http://localhost:1234/authorized/listitems/create';
  export default {
    data: () => ({
      user: {},
      lists: [],
      errorMessage: '',
      succesMessage: '',
      loading: false,
      newList: {
        title: '',
        description: '',
      },
      newListItem: {
        text: '',
        list_id: '',
        list_array_index: '',
      }
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

        title = this.newList.title ? this.newList.title.toString().trim() : '';
        description = this.newList.description ? this.newList.description.toString().trim() : '';

        if(title.length < 1) this.errorMessage = "Please fill out the title field.";
        else if(title.length > 50) this.errorMessage = "Your title is too long.";
        else if(description.length > 300) this.errorMessage = "Your description is too long.";
        else {
          const body = {
            list_title: this.newList.title,
            list_description: this.newList.description,
          }
          this.loading = true;
          fetch(ADD_LIST_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              authorization: `Bearer ${localStorage.token}`,
              'content-type': 'application/json',
            },
          })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then((error) => {
              console.log(error);
              throw new Error(error);
            });
          })
          .then((result) => {
            console.log(result);
            this.succesMessage = 'Added list';
            this.loading = false;
            this.newList = {
              title: '',
              description: '',
            }
            const inserted = {
              description: result.list_description,
              items: {},
              title: result.list_title,
              list_id: result.list_id,
            }
            console.log(inserted);
            this.lists.push(inserted);
          })
          .catch((error) => {
            console.log(error);
            this.errorMessage = error;
            this.loading = false;
            this.newList = {
              title: '',
              description: '',
            }
          });
        }
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
      removeList(listId, arrIndex) {
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
        .then((deletedId) => {
          console.log(deletedId);
          this.loading = false;
          this.lists.splice(arrIndex, 1);
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
      onClickAddListItem(listId, listArrIndex) {
        console.log("onclickaddlistitem");
        this.newListItem.list_id = listId;
        this.newListItem.list_array_index = listArrIndex;
      },
      addListItem() {
        //Set all things to 0
        $('#list-item-modal').modal('hide');
        this.errorMessage = '';
        this.succesMessage = '';

        //Validation
        let text = this.newListItem.text;
        if(!text) this.errorMessage = "Please fill out the text field.";
        else {
          text = text.toString().trim();
          if(text.length < 1) this.errorMessage = "Please fill out the text field.";
          else if(text.length > 250)
          this.errorMessage = "Your text is too long! Keep it under 250 characters.";
          else if(!this.newListItem.list_id) this.errorMessage = "Oops! Please try again.";
          else {
            //Define request
            const body = {
              list_item_text: text,
              list_id: this.newListItem.list_id,
            };
            console.log(body);
            this.loading = true;
            //Fetch
            fetch(ADD_LIST_ITEM_URL, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${localStorage.token}`,
              },
            })
            .then((response) => {
              if(response.ok) {
                return response.json();
              }
              return response.json().then((error) => {
                console.log(error);
                throw new Error(error);
              });
            })
            .then((list_item) => {
              this.lists[this.newListItem.list_array_index].items.unshift(list_item);

              this.loading = false;
              this.newListItem = {
                list_id: '',
                list_item_text: '',
                list_array_index: '',
              };
            })
            .catch((error) => {
              console.log(error);
              this.errorMessage = error;

              this.loading = false;
              this.newListItem = {
                list_id: '',
                list_item_text: '',
                list_array_index: '',
              };
            });
          }
        }
      },
    },
  };

</script>

<style>
.list-group-item .close {
  color: var(--danger);
  text-shadow: 0 1px 0 black;
}
</style>
