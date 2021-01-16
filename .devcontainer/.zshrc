export ZSH="/home/vscode/.oh-my-zsh"

ZSH_THEME="bureau"

COMPLETION_WAITING_DOTS="true"

plugins=(zsh-autosuggestions zsh-syntax-highlighting git)

export PROMPT_COMMAND='history -a'
export HISTFILE=/commandhistory/.zsh_history

source $ZSH/oh-my-zsh.sh