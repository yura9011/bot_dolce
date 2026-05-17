<plan>
  <goal>Fix "paused.map is not a function" error in dashboard</goal>
  <prerequisites>
    <item>Browser console shows error at app.js:298</item>
    <item>WebSocket emits paused as object {userId: data}</item>
    <item>Frontend expects array [{userId, ...}]</item>
  </prerequisites>
  <tasks>
    <task id="1">
      <description>Fix updateModalPausedUsers to handle both object and array</description>
      <files>public-central/app.js</files>
      <changes>Convert paused object to array if needed before .map()</changes>
      <verification>Browser console shows no "paused.map is not a function" error</verification>
    </task>
    <task id="2">
      <description>Fix updateAgentCard paused handling</description>
      <files>public-central/app.js</files>
      <changes>Ensure paused data is always an array in WebSocket updates</changes>
      <verification>Agent cards render correctly with paused users</verification>
    </task>
  </tasks>
  <success_criteria>
    <criterion>No JavaScript errors in browser console</criterion>
    <criterion>Dashboard shows agent cards with status</criterion>
    <criterion>"Ver Detalles" button opens modal correctly</criterion>
  </success_criteria>
</plan>
