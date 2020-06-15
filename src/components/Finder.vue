<template>
  <div class="finder">
    <h2>Finder: {{ path }}</h2>
    <div class="example-tree">
      <tree :data="treeData0" >
        <span class="tree-text" slot-scope="{ node }">
          <template v-if="!node.hasChildren()">
            <i class="ion-android-star"></i>
            {{ node.text }}
          </template>

          <template v-else>
            <i :class="[node.expanded() ? 'ion-android-folder-open' : 'ion-android-folder']"></i>
            {{ node.text }}
          </template>
        </span>
      </tree>
    </div>
  </div>
</template>

<script>
import LiquorTree from 'liquor-tree'

function getTreeData0() {
  return [
    { text: 'Disc C:', state: { expanded: true }, children: [
      { text: 'PerfLogs' },
      { text: 'Users', children: [
        { text: 'User 1' },
        { text: 'User 2' },
        { text: 'User 3' }
      ]},
      { text: 'tomcat' },
      { text: 'sysCache' },
      { text: 'Program Files', children: [
        { text: 'Intel' },
        { text: 'Internet Explorer' },
        { text: 'Opera' },
        { text: 'Oracle' }
      ]}
    ]}
  ]
}

export default {
  name: 'Finder',
  props: {
    path: String
  },
  components: {
    'tree': LiquorTree
  },
  data: () => ({
    treeData0: getTreeData0()
  })
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
