(function () {
  const API_DOMAIN = "__API_DOMAIN__";
  const COMPANY_ID = "__COMPANY_ID__";

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

  const STAGES = {
    initial: "initial",
    pending: "pending",
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

    setup() {
      this.stage = STAGES.initial;

      this.element = document.createElement("div");

      this.sync();
    }

    listen() {
      const _self = this;

      const handleError = (err) => {
        console.warn({ err });

        if (_self.canListen()) {
          _self.listen();
        }
      };

      try {
        get(`sessions/${this.sessionId}/listen`)
          .then((res) => res.json())
          .then((session) => {
            _self.set("session", session, true);
          })
          .catch((err) => handleError(err));
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

    getBidState() {
      const sessionBid = Number(this.session?.bid);

      if (Number.isNaN(sessionBid) && sessionBid !== 0) {
        return false;
      }

      const user = this.user;

      if (user == null) {
        return true;
      }

      const sessionUsers = this.session.users || [];
      const userIndex = sessionUsers.findIndex((it) => {
        return it.id === user.id;
      });
      const inSession = userIndex !== -1;

      if (!inSession) {
        return true;
      }

      const userBid = Number(sessionUsers[userIndex]?.bid);

      return userBid !== sessionBid;
    }

    set(key, value, shouldRender = false) {
      this[key] = value;

      switch (key) {
        case "session": {
          const hasBidRequest = this.getBidState();

          if (hasBidRequest) {
            const bid = Number(this.session.bid);

            const ownBid = this.ask(
              `The "${bid}" bid  was requested. Accept or Change?`,
              (value) => {
                return! Number.isNaN(Number(value));
              },
              (value) => (Number(value))
            );
            const hasConfirm = ownBid == bid;

            if (hasConfirm) {
              this.set("pendingBid", bid);
            } else {
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
      const email = this.ask("Email", (res) => !!res.trim());
      const password = this.ask("password", (res) => !!res.trim());

      this.set("loading", true, true);

      const sessionId = this.sessionId;

      const response = await post("login", null, { email, password })
        .then((res) => res.json())
        .then(async (user) => {
          await post(`sessions/${sessionId}/users`, null, { id: user?.id });

          return user;
        })
        .catch((err) => {
          return {
            error: err.message,
          };
        });

      this.set("user", response);

      this.set("stage", STAGES.pending);

      this.set("loading", false, true);
    }

    handleSendBid() {
      const value = this.ask(
        "What is your Bid?",
        (bid) => !Number.isNaN(Number(bid)) && bid > 0
      );

      if (!value) {
        return;
      }

      const body = {
        value: Number(value),
        userId: this.user.id,
      };

      post(`sessions/${this.sessionId}/bids`, null, body);
    }

    async sync() {
      const session = await get(`sessions/${this.sessionId}`).then((res) =>
        res.json()
      );

      this.set("session", session);

      this.listen();

      this.render();
    }

    connect() {}

    render() {
      if (this.element.parentNode == null) {
        document.body.append(this.element);
      }

      let contentEl = null;

      if (this.loading) {
        contentEl = document.createElement("p");
        contentEl.innerText = "Loading";
      } else {
        switch (this.stage) {
          case STAGES.initial: {
            contentEl = document.createElement("button");
            contentEl.innerText = "Log In";
            contentEl.onclick = this.auth.bind(this);
            break;
          }
          case STAGES.pending: {
            contentEl = document.createElement("button");
            contentEl.innerText = "Bid On";
            contentEl.onclick = () => this.handleSendBid();
            break;
          }
          default: {
          }
        }
      }

      this.element.innerHTML = "";
      this.element.append(contentEl);

      // const debugEl = document.createElement("i");
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
  const playerId = el.getAttribute("player");
  const { connectionId } = parsePath(location.pathname);

  const startClient = (sessionId) => {
    const _client = new Client(playerId, sessionId);
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
        console.warn(err.message);
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
        console.warn(err.message);
      });
  };

  getSession();
})();
