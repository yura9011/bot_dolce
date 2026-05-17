<plan>
  <goal>Fix dashboard rendering - show agent cards correctly</goal>
  <prerequisites>
    <item>dashboard-central.js running on port 3000</item>
    <item>Browser access (F12 for console)</item>
    <item>agent-manager.js running (port 3011 for santa-ana)</item>
  </prerequisites>
  <tasks>
    <task id="1">
      <description>Debug JavaScript errors in browser console</description>
      <files>public-central/app.js</files>
      <changes>Check F12 console for errors preventing card rendering</changes>
      <verification>Open http://localhost:3000, F12 console shows no red errors</verification>
    </task>
    <task id="2">
      <description>Fix fetch URLs (relative vs absolute)</description>
      <files>public-central/app.js</files>
      <changes>Change fetch('/api/agents') to fetch('http://localhost:3000/api/agents') if needed</changes>
      <verification>Network tab shows successful API calls</verification>
    </task>
    <task id="3">
      <description>Verify WebSocket client loads</description>
      <files>public-central/index.html</files>
      <changes>Ensure socket.io/socket.io.js loads before app.js</changes>
      <verification>Console shows "Conectado al dashboard via WebSocket"</verification>
    </task>
    <task id="4">
      <description>Test complete flow</description>
      <files>All dashboard files</files>
      <changes>Full integration test</changes>
      <verification>Screenshot showing agent cards with "Ver Detalles" button</verification>
    </task>
  </tasks>
  <success_criteria>
    <criterion>Agent cards visible and rendered correctly</criterion>
    <criterion>No JavaScript errors in browser console</criterion>
    <criterion>WebSocket connects successfully</criterion>
    <criterion>Modal opens when clicking "Ver Detalles"</criterion>
  </success_criteria>
</plan>
