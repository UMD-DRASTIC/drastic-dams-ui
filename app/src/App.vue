<template>
<div id="app" class="container-fluid">
  <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <ul class="nav nav-pills nav-fill col-md-9 px-3">
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/access">
          <font-awesome-icon icon="fa-search fa-xl" />
          Access
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/description">
          <font-awesome-icon icon="fa-boxes-stacked fa-xl" />
          Description
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/submissions">
          <font-awesome-icon icon="fa-people-carry-box fa-xl" />
          Submissions
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/topics">
          <font-awesome-icon icon="fa-tag fa-xl" />
          Topics
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/dashboard">
          <font-awesome-icon icon="fa-chart-pie fa-xl" />
          Dashboard
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <a class="nav-link" href="#">
          <font-awesome-icon icon="fa-right-from-bracket fa-xl" />
        </a>
      </li>
    </ul>
  </nav>
  <main role="main">
    <!-- <div class="h-100 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"> -->
    <!-- <div class="container-fluid h-100 px-0"> -->
      <router-view />
    <!-- </div> -->
  </main>

</div>
</template>

<script>
export default {
  name: 'app',
  components: { }
}
</script>

<style>
html, body, #main {
  /* height: 100%; */
}

#app > main {
  margin-top: 45px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center;*/
  color: #2c3e50;
  padding: 0px;
  padding-top: 16px;
  height: 100%;
}
div.folderview {
  width: auto;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
  padding: 0px;
  margin: 0px;
}

.nav a {
  color: #cccccc;
}

a.router-link-active {
  color: #bbbbff;
  font-weight: bolder;
}

/* Style the tabs */
.tabs {
    overflow: hidden;
  margin-left: 20px;
    margin-bottom: -2px;
}

.tabs ul {
    list-style-type: none;
    margin-left: 20px;
}

.tabs a{
    float: left;
    cursor: pointer;
    padding: 12px 24px;
    transition: background-color 0.2s;
    border: 1px solid #ccc;
    border-right: none;
    background-color: #f1f1f1;
    border-radius: 10px 10px 0 0;
    font-weight: bold;
}
.tabs a:last-child {
    border-right: 1px solid #ccc;
}

/* Change background color of tabs on hover */
.tabs a:hover {
    background-color: #aaa;
    color: #fff;
}

/* Styling for active tab */
.tabs a.active {
    background-color: #fff;
    color: #484848;
    border-bottom: 2px solid #fff;
    cursor: default;
}

/* Style the tab content */
.tabcontent {
    padding: 30px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 3px 3px 6px #e1e1e1
}
</style>
