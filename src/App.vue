<template>
<div id="app" class="container-fluid">
  <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">DAMS</a>
    <input class="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search">
    <ul class="navbar-nav px-3">
      <li class="nav-item text-nowrap">
        <a class="nav-link" href="#">Sign out</a>
      </li>
    </ul>
  </nav>
  <div class="container-fluid">
    <div class="row">
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard">
                <feather size="1.1em" type="inbox"></feather>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/description">
                <feather size="1.1em" type="archive"></feather>
                Archival Desription <span class="sr-only">(current)</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/submissions">
                <feather size="1.1em" type="inbox"></feather>
                Submissions
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/destructions">
                <feather size="1.1em" type="trash-2"></feather>
                Destructions
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/reports">
                <feather size="1.1em" type="pie-chart"></feather>
                Reports
              </router-link>
            </li>
          </ul>

          <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Saved Folders</span>
            <a class="d-flex align-items-center text-muted" href="#" aria-label="Add a new report">
              <feather size="1.1em" type="plus-circle"></feather>
            </a>
          </h6>
          <ul class="nav flex-column mb-2">
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="file-text"></span>
                Current month
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="file-text"></span>
                Last quarter
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="file-text"></span>
                Social engagement
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                <span data-feather="file-text"></span>
                Year-end sale
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
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
  background-color: #bfbfbf;
  width: auto;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
  padding: 0px;
  margin: 0px;
}
</style>
