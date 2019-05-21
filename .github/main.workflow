workflow "Main" {
    on = "push"
    resolves = ["Test"]
}

action "Install" {
    uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
    args = "install"
}

action "Build" {
    needs = "Install"
    uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
    args = "run build"
}

action "Test" {
    needs = "Build"
    uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
    args = "test"
}
