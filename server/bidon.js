(function () {
  const API_DOMAIN = "__API_DOMAIN__";
  const COMPANY_ID = "__COMPANY_ID__";
  const PLAYER_ID = "__PLAYER_ID__";

  const getStorage = () => {
    return localStorage;
  };

  const joinPath = (path) => {
    let url = `${API_DOMAIN}/api/${path.replace(/^\//, "")}`;

    return url;
  };

  const post = (path, props, body) => {
    return fetch(joinPath(path), {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...props,
      body: typeof body === "object" ? JSON.stringify(body) : body,
    });
  };

  const put = (path, props, body) => {
    return post(path, { ...props, method: "put" }, body);
  };

  const get = (path, props) => {
    return fetch(joinPath(path), {
      ...props,
    });
  };

  const AUTH_KEY = "_auth_token";

  const STAGES = {
    initial: "initial",
    pending: "pending",
    ended: "ended",
  };

  class Client {
    playerId;
    sessionId;
    authToken;
    user;
    stage;

    pullRequest;

    element;

    constructor(playerId, sessionId) {
      this.playerId = playerId;
      this.sessionId = sessionId;

      this.setup();
    }

    canListen() {
      return [STAGES.initial, STAGES.pending].includes(this.stage);
    }

    logged() {
      return this.user != null && this.user.id != null;
    }

    setup() {
      this.stage = STAGES.initial;

      this.element = document.createElement("div");

      try {
        this.authToken = JSON.parse(getStorage().getItem(AUTH_KEY));
      } catch (err) {}

      this.sync();
    }

    listen() {
      const _self = this;

      if (this.abortController?.abort) {
        this.abortController.abort();
      }

      if (!_self.canListen()) {
        return;
      }

      const handleError = (err) => {
        console.warn({ err });

        if (_self.canListen()) {
          _self.listen();
        } else {
          console.warn("can't listen");
        }
      };

      try {
        const abortController = new AbortController();
        _self.set("abortController", abortController);

        get(`sessions/${this.sessionId}/listen`, {
          signal: abortController.signal,
        })
          .then((res) => res.json())
          .then((session) => {
            console.log('listened', session);

            _self.set("session", session, true);
          })
          .finally(() => {
            _self.listen();
            _self.set("abortController", null);
          });
      } catch (err) {
        handleError(err);
      }
    }

    ask(label, validate = null, format = null) {
      const answer = prompt(label);

      if (validate && !validate(answer)) {
        return this.ask(label, validate);
      }

      return format ? format(answer) : answer;
    }

    getSessionBid() {
      return Number(this.session?.bid);
    }

    getUserBid() {
      const user = this.user;

      if (user == null) {
        return null;
      }

      const sessionUsers = this.session?.users || [];
      const userIndex = sessionUsers.findIndex((it) => {
        return it.id === user.id;
      });
      const inSession = userIndex !== -1;

      if (!inSession) {
        return null;
      }

      return Number(sessionUsers[userIndex]?.bid);
    }

    getUserBidState() {
      const bid = Number(this.getUserBid());

      console.log("getUserBidState", { bid });

      return !Number.isNaN(bid) && bid > 0;
    }

    getBidState() {
      const sessionBid = this.getSessionBid();

      if (Number.isNaN(sessionBid) && sessionBid !== 0) {
        return false;
      }

      const userBid = this.getUserBid();

      if (!userBid) {
        return true;
      }

      return userBid !== sessionBid;
    }

    validate() {
      const hasBidRequest = this.getBidState();
      
      this.pendingBid = hasBidRequest ? false : this.pendingBid;

      // console.warn({ hasBidRequest });

      if (hasBidRequest || this.pendingBid) {
        this.pendingBid = false;
        this.handleSendBid();
      }
    }

    set(key, value, shouldRender = false) {
      this[key] = value;

      switch (key) {
        case "session": {
          switch (value?.status) {
            case "active":
            case "resolved": {
              this.set("stage", STAGES.ended, true);
              break;
            }
            default: {
              this.set(
                "stage",
                this.logged() ? STAGES.pending : STAGES.initial,
                true
              );
              break;
            }
          }
          break;
        }
      }

      if (shouldRender) {
        this.render();
      }
    }

    async auth() {
      if (this.authToken != null) {
        const useCached = confirm(
          `Continue as ${this.authToken.name || this.authToken.email}?`
        );

        this.set("user", useCached ? this.authToken : null);

        this.validate();
      }

      if (this.user == null || !this.user.id) {
        const email = this.ask("Email", (res) => !!res.trim());
        const password = this.ask("password", (res) => !!res.trim());

        this.set("loading", true, true);

        const user = await post("login", null, { email, password })
          .then((res) => res.json())
          .then((user) => {
            getStorage().setItem(AUTH_KEY, JSON.stringify(user));

            return user;
          })
          .catch((err) => {
            return {
              error: err.message,
            };
          });

        this.set("user", user);

        this.validate();

        this.set("loading", false, true);
      }

      this.connect();
    }

    handleSendBid() {
      const _self = this;
      const value = this.ask("What is your Bid?", (bid) => true);

      if (!value || !this.user) {
        return;
      }

      const body = {
        value: Number(value),
        userId: _self.user.id,
        autoActivation: true,
      };

      post(`sessions/${this.sessionId}/bids`, null, body);
    }

    async sync() {
      const session = await get(`sessions/${this.sessionId}`)
        .then((res) => res.json())
        .catch((err) => {
          return null;
        });

      this.set("session", session, true);

      this.listen();

      this.render();
    }

    async connect() {
      const user = this.user;

      if (!user?.id) {
        return this.set("stage", STAGES.initial, true);
      }

      const sessionId = this.sessionId;

      const session = await post(`sessions/${sessionId}/users`, null, {
        id: user?.id,
        playerId: PLAYER_ID,
      })
        .then((res) => res.json())
        .catch((err) => {
          return null;
        });

      console.log({ session });

      this.set("session", session, true);

      this.validate();
    }

    render() {
      const _self = this;
      if (this.element.parentNode == null) {
        document.body.append(this.element);
      }

      let contentEl = null;

      if (this.loading) {
        contentEl = document.createElement("p");
        contentEl.innerText = "Loading";
      } else {
        const bid = Number(this.session?.bid);
        const hasBidRequest = this.getBidState();
        const hasBidPosted = this.getUserBidState();
        const canPostBid = hasBidRequest || !hasBidPosted;

        switch (this.stage) {
          case STAGES.initial: {
            contentEl = document.createElement("button");
            contentEl.innerText = hasBidRequest
              ? `Current Bid is "${bid}". You In?`
              : hasBidPosted
              ? "waiting for opponent..."
              : "Bid On";
            contentEl.onclick = () => {
              _self.pendingBid = !hasBidRequest;

              _self.auth();
            };
            break;
          }
          case STAGES.pending: {
            contentEl = document.createElement(canPostBid ? "button" : "p");
            contentEl.innerText = hasBidRequest
              ? `Opponent bet "${bid}". Respond?`
              : hasBidPosted
              ? "waiting for opponent..."
              : "Bid On";

            if (canPostBid) {
              contentEl.onclick = this.handleSendBid.bind(this);
            }
            break;
          }
          default: {
            contentEl = document.createElement('span');
            contentEl.innerText = 'Done. Injoy!';
          }
        }
      }

      this.element.innerHTML = "";

      if (contentEl) {
        this.element.append(contentEl);
      }

      // const debugEl = document.createElement("i");
      // debugEl.setAttribute("style", ``);
      // debugEl.innerHTML = JSON.stringify(this.session);
      // this.element.append(debugEl);
    }
  }

  const parsePath = (path) => {
    const parts = path.split("/");

    const connectionId = parts.slice(-1)[0];

    return { parts, connectionId };
  };

  const el = document.currentScript;
  const { connectionId } = parsePath(location.pathname);

  const startClient = (sessionId) => {
    const _client = new Client(PLAYER_ID, sessionId);
  };

  const createSession = () => {
    post(`connections/${COMPANY_ID}/${connectionId}`)
      .then((res) => res.json())
      .then(({ error, sessionId }) => {
        if (!sessionId) {
          return;
        }

        startClient(sessionId);
      })
      .catch((err) => {
        // console.warn(err.message);
      });
  };

  const getSession = () => {
    get(`connections/${COMPANY_ID}/${connectionId}`)
      .then((res) => res.json())
      .then(({ error, sessionId }) => {
        if (!sessionId) {
          return createSession();
        }

        startClient(sessionId);
      })
      .catch((err) => {
        // console.warn(err.message);
      });
  };

  getSession();
})();
