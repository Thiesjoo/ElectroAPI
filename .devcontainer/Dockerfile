FROM alpine:latest
ARG USERNAME=vscode

# Packages
RUN apk add zsh git openssh gnupg nodejs libgcc libstdc++ npm sudo openssl --no-cache 

# User
RUN  adduser --shell /bin/zsh --uid 1000 --disabled-password $USERNAME  && \
     mkdir /commandhistory && \
     touch /commandhistory/.bash_history && \
     chown -R $USERNAME /commandhistory 

## ZSH Setup
USER $USERNAME
RUN  sh -c "$(wget -O- https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)" "" --unattended &> /dev/null && \
     git clone https://github.com/zsh-users/zsh-autosuggestions /home/$USERNAME/.oh-my-zsh/custom/plugins/zsh-autosuggestions && \
     git clone https://github.com/zsh-users/zsh-syntax-highlighting.git /home/$USERNAME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting && \
     mkdir /home/$USERNAME/.app
COPY .zshrc /home/$USERNAME/

# JWT initialization
RUN  ssh-keygen -b 2048 -t rsa -m PEM -f /home/$USERNAME/.app/jwt.key -q -N "" && \
     openssl rsa -in /home/$USERNAME/.app/jwt.key -pubout -outform PEM -out /home/$USERNAME/.app/jwt.key.pub 

ENTRYPOINT sh -c "trap : TERM INT; sleep infinity & wait"
EXPOSE 3000