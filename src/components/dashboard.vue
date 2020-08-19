<template>
 <div class="dashboard">
   <h2 class="h2">Dashboard</h2>
   <div class="btn-toolbar mb-2 mb-md-0">
     <div class="btn-group mr-2">
       <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
       <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
     </div>
     <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
       <span data-feather="calendar"></span>
       This week
     </button>
   </div>
 </div>
</template>
<script>

export default {
 name: "Dashboard"
};

</script>
<style scoped>
</style>
