const { execSync } = require("child_process");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}


run("node srv/test_1.js");

run("cds deploy --to sqlite");

run("cds run");
