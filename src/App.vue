<template>
<div id="app" class="container-fluid">
  <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <router-link class="navbar-brand col-sm-1 col-md-1 mr-0" to="/dashboard">
      <feather size="1.1em" type="home"></feather> Home
    </router-link>
    <input class="form-control form-control-dark col-md-2" type="text" placeholder="Search" aria-label="Search">

    <ul class="nav nav-pills nav-fill col-md-9 px-3">
      <li class="nav-item text-nowrap">

      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/description">
          <feather size="1.1em" type="archive"></feather>
          Archival Desription <span class="sr-only">(current)</span>
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/submissions">
          <feather size="1.1em" type="inbox"></feather>
          Submissions
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/destructions">
          <feather size="1.1em" type="trash-2"></feather>
          Destructions
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/reports">
          <feather size="1.1em" type="pie-chart"></feather>
          Reports
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <router-link class="nav-link" to="/saved">
          <feather size="1.1em" type="star"></feather>
          Bookmarks
        </router-link>
      </li>
      <li class="nav-item text-nowrap">
        <a class="nav-link" href="#">Sign out</a>
      </li>
    </ul>
  </nav>

  <div class="container-fluid">
    <div class="row">
      <main role="main" class="col-md-12 ml-sm-auto col-lg-12 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <router-view />
        </div>
      </main>
    </div>
  </div>

</div>
</template>

<script>
import VueFeather from 'vue-feather';

export default {
  name: 'app',
  components: {
    'feather': VueFeather
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  padding: 0px;
  padding-top: 40px;
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
