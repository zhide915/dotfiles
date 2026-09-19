eval "$(fnm env --use-on-cd --version-file-strategy=recursive)"

if [ "$HERDR_ENV" = "1" ] && command -v cygpath >/dev/null 2>&1; then
  __herdr_osc7() { printf '\033]7;file:///%s\a' "$(cygpath -m "$PWD")"; }
  PROMPT_COMMAND="__herdr_osc7${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
fi
