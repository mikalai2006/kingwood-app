<script setup lang="ts" async>
const data = await fetch("https://jsonplaceholder.typicode.com/posts")
  .then((r) => r.json())
  .catch((e) => {
    console.error(e);
  });
</script>

<template>
  <div>Dashboard page</div>
  <div>
    <table>
      <thead>
        <tr>
          <th>Order</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data">
          <td class="w-4/12">№{{ item.id }} {{ item.title }}</td>
          <td class="w-4/12">№{{ item.id }} {{ item.title }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
