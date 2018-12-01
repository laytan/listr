<template>
  <div id="home" class="container">
    <div class="jumbotron">
      <h1 class="display-3">Welcome to Listr!</h1>
      <p class="lead">
        This is a simple website where you can share
        lists between frieds and family,
        making it so that you don't have to check
        if somebody already bought that gift you want to get someone.
      </p>
      <hr class="my-4">
      <p>
        Listr authors can't see what's bought.
      </p>
      <p class="lead">
        <router-link tag="a" class="btn btn-primary btn-lg" href="#" role="button">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  components: {
  },
};
</script>
