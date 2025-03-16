<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <title>Employee Shift Scheduler</title>
  <meta name="description" content="Get the best out of your schedules." />
</svelte:head>
{@render children()}
