<script>/* eslint linebreak-style: ["error", "windows"] */</script>
<template>
    <div class="container">
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
        <div v-else class="mt-3">
            <h2 class="h3">Hello {{ user.username }}!</h2>
            <h3 class="h4">These are all the lists you can buy from.</h3>
            <div v-for="(list, listIndex) in lists" :key="list.list_id" class="card my-3">
                <div class="card-body">
                    <h4 class="card-title">{{ list.title }}</h4>
                    <h6 class="card-subtitle mb-2 text-muted">
                        {{ list.description }}
                    </h6>
                    <p class="card-text">Author: {{ list.user.user_name }}</p>
                    <div class="list-group">
                        <div v-for="(item, itemIndex) in list.list_items" :key="item.list_item_id"
                        class="list-group-item list-group-item-action">
                            <del v-if="item.is_bought">{{ item.list_item_text }}</del>
                            <span v-else>{{ item.list_item_text }}</span>
                            <button v-if="!item.is_bought"
                            type="button" class="btn btn-success float-right"
                            @click="onClickBought(item.list_item_id, itemIndex, listIndex)"
                            aria-label="Bought">
                                <span>I bought this!</span>
                            </button>
                            <button v-else-if="item.bought_by && item.bought_by == user.id"
                            type="button" class="btn btn-danger float-right"
                            @click="onClickUnBuy(item.list_item_id, itemIndex, listIndex)"
                            aria-label="Un buy">
                                <span>I didn't buy this!</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const API_URL = 'http://localhost:1234';

export default {
    data: () => ({
        loading: false,
        errorMessage: '',
        successMessage: '',
        user: {},
        lists: [],
    }),
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
            this.getTimeline();
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
        getTimeline() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';
            fetch(API_URL + '/authorized/list/timeline', {
                headers: {
                authorization: `Bearer ${localStorage.token}`,
                },
            })
            .then(response => {
                return (response.ok) ? response.json() : response.json().then(err => {
                   throw new Error(error.message);
                });
            })
            .then(lists => {
                this.lists = lists;
                this.loading = false;
            })
            .catch(err => {
                this.errorMessage = err.message;
                this.loading = false;
            });
        },
        onClickBought(list_item_id, itemIndex, listIndex) {
            this.loading = false;
            this.errorMessage = '';
            this.successMessage = '';

            const body = {
                list_item_id: list_item_id,
            }

            fetch(API_URL + '/authorized/list/item/bought', {
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
                this.succesMessage = "Succesfully bought!";
                this.lists[listIndex].list_items[itemIndex].is_bought = 1;
                this.lists[listIndex].list_items[itemIndex].bought_by = this.user.id;
            })
            .catch(err => {
                this.errorMessage = err.message;
            });
        },
        onClickUnBuy(list_item_id, itemIndex, listIndex) {
            this.loading = false;
            this.errorMessage = '';
            this.successMessage = '';

            const body = {
                list_item_id: list_item_id,
            }

            fetch(API_URL + '/authorized/list/item/unbuy', {
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
                this.lists[listIndex].list_items[itemIndex].is_bought = 0;
                this.lists[listIndex].list_items[itemIndex].bought_by = null;
            })
            .catch(err => this.errorMessage = err.message );
        },
    },
}

</script>

<style>
</style>
