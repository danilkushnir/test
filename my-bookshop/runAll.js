const { execSync } = require("child_process");

function run(cmd) {
  console.log(">>> " + cmd);
  execSync(cmd, { stdio: "inherit" });
}


run("node srv/test_1.js");

run("cds deploy --to sqlite");

run("cds run");
