<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link tag="a" to="/" class="navbar-brand">Listr</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarColor01"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarColor01">
          <ul class="navbar-nav mr-auto">
            <router-link tag="li" to="/dashboard" class="nav-item">
              <a class="nav-link">Dashboard</a>
            </router-link>
            <router-link tag="li" to="/login" class="nav-item">
              <a class="nav-link">Login</a>
            </router-link>
            <router-link tag="li" to="/signup" class="nav-item">
              <a class="nav-link">Sign up</a>
            </router-link>
          </ul>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<style>
</style>
