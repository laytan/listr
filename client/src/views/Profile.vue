<script>/* eslint linebreak-style: ["error", "windows"] */</script>
<template>
    <div class="container">
        <div id="add-to-list-modal" class="modal">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            Give {{ addToListUser.user_name }} authorithy over a list
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="list-group">
                            <div v-for="(list, index) in lists" :key="list.list_id"
                            class="list-group-item list-group-item-action">
                                {{ list.list_id }}. {{ list.list_title }}
                                <button
                                v-if="!list.auth"
                                data-dismiss="modal"
                                @click="giveAuthority(list.list_id, addToListUser.user_id, index)"
                                type="button" class="btn btn-success float-right"
                                aria-label="give authority">
                                    <span>Give authority</span>
                                </button>
                                <button
                                v-else
                                data-dismiss="modal"
                                @click="removeAuthority(list.list_id, addToListUser.user_id, index)"
                                type="button" class="btn btn-danger float-right"
                                aria-label="remove authority">
                                    <span>Remove authority</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"
                        data-dismiss="modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="errorMessage" class="alert alert-dismissible alert-danger mt-4">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>Error!</strong> {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-dismissible alert-success mt-4">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>Success!</strong> {{ successMessage }}
        </div>
        <div v-if="loading">
            <p v-if="loading">Loading...</p>
        </div>
        <div v-else>
            Hello {{ user.username }}!
            <form @submit.prevent="">
                <fieldset>
                    <legend>Search users</legend>
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" class="form-control" id="username"
                                v-model="searchUser"
                                aria-describedby="usernameHelp" placeholder="Enter username">
                        <small id="usernameHelp" class="form-text text-muted">
                            Enter a username to search through users.
                        </small>
                    </div>
                </fieldset>
            </form>
            <div class="list-group">
                <div v-for="user in searchResult" :key="user.user_id"
                class="list-group-item list-group-item-action">
                    {{ user.user_name }}
                    <button @click="onClickAddToList(user)"
                    data-toggle="modal" data-target="#add-to-list-modal"
                    type="button" class="btn btn-success float-right"
                    aria-label="Add to a list">
                        <span>Add to a list</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const API_URL = 'http://localhost:1234';

export default {
    data: () => ({
        user: {},
        loading: false,
        errorMessage: '',
        successMessage: '',
        searchUser: '',
        searchResult: [],
        addToListUser: {},
        lists: [],
    }),
    watch: {
        searchUser: {
            handler(toSearch) {
                this.errorMessage = '';
                toSearch = toSearch.toString().trim();
                if(toSearch.length < 3) {
                    return;
                }

                const body = {
                    toSearch: toSearch,
                }
                fetch(API_URL + '/user/search', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'content-type': 'application/json',
                    },
                })
                .then(response => {
                    return (response.ok) ? response.json() : response.json().then(err => {
                        throw new Error(error.message);
                    });
                })
                .then(result => {
                    if(result.message) throw new Error(result.message);
                    this.searchResult = result.users;
                })
                .catch(error => this.errorMessage = error.message );
            }
        },
    },
    mounted() {
        this.loading = true;
        if(!localStorage.token) {
            this.$router.push('/login');
            return;
        }
        fetch(API_URL + '/authorized/verify', {
            headers: {
                authorization: `Bearer ${localStorage.token}`,
            },
        })
        .then(response => {
            return (response.ok) ? response.json() : response.json().then(err => {
                throw new Error("Unauthorized request");
            });
        })
        .then(user => {
            this.user = user;
            this.loading = false;
        })
        .catch(error => {
            this.loading = false;
            this.logout();
        });
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        onClickAddToList(user) {
            this.addToListUser = user;
            this.getLists();
        },
        getLists() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';
            const user_id = this.addToListUser.user_id;
            const body = {
                "user_id": user_id,
            }
            fetch(API_URL + '/authorized/list/all-with-authorization', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    authorization: `Bearer ${localStorage.token}`,
                    'content-type': 'application/json',
                },
            })
            .then(response => {
                return (response.ok) ? response.json() : response.json().then(err => {
                    throw new Error(error.message);
                });
            })
            .then(result => {
                this.lists = result;
                this.loading = false;
            })
            .catch(error => {
                this.errorMessage = error.message;
                this.loading = false;
            });
        },
        giveAuthority(list, user, index) {
            this.errorMessage = '';
            this.successMessage = '';
            const body = {
                "list_id": list,
                "user_id": user,
            }

            this.loading = true;
            fetch(API_URL + '/authorized/list/authorize', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${localStorage.token}`,
                },
            })
            .then(response => {
                return (response.ok) ? response.json() : response.json().then(err => {
                    throw new Error(error.message);
                });
            })
            .then(result => {
                this.successMessage = "Succesfully gave authorization.";
                this.loading = false;
            })
            .catch(error => {
                this.errorMessage = error.message;
                this.loading = false;
            });
        },
        removeAuthority(list, user, index) {
            this.errorMessage = '';
            this.successMessage = '';
            const body = {
                "list_id": list,
                "user_id": user,
            }

            this.loading = true;
            fetch(API_URL + '/authorized/list/un-authorize', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${localStorage.token}`,
                },
            })
            .then(response => {
                return (response.ok) ? response.json() : response.json().then(err => {
                    throw new Error(error.message);
                });
            })
            .then(result => {
                this.successMessage = "Succesfully removed authorization.";
                this.loading = false;
            })
            .catch(error => {
                this.errorMessage = error.message;
                this.loading = false;
            });
        },
    },
}

</script>

<style>
</style>
