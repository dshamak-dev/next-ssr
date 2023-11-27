(function () {
  const API_DOMAIN = "__API_DOMAIN__";
  const COMPANY_ID = "__COMPANY_ID__";
  let PLAYER_ID = null;

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

  const USER_STORAGE_KEY = "_auth_token";

  const getStorage = () => {
    return localStorage;
  };

  const setUserToken = (token) => {
    return getStorage().setItem(
      USER_STORAGE_KEY,
      typeof token === "object" ? JSON.stringify(token) : token
    );
  };

  const getUserToken = () => {
    const record = getStorage().getItem(USER_STORAGE_KEY);

    try {
      return JSON.parse(record);
    } catch (err) {
      return null;
    }
  };

  const SESSION_STATUS_TYPES = {
    // not started
    draft: "pending",
    // all bids accepted or declined
    closed: "closed",
    active: "active",
    // resolved
    closed: "resolved",
  };

  const USER_STATUS_TYPES = {
    // not connected or no bid posted
    draft: "draft",
    // there is a bid request from opponent
    request: "request",
    // you have a bid posted
    pending: "pending",
    // all bids accepted or declined
    locked: "locked",
  };

  class UIComponent {
    id = "contest-ui";
    containerElement;

    constructor() {
      this.containerElement = document.getElementById(this.id);

      if (!this.containerElement) {
        this.containerElement = document.createElement("div");
        this.containerElement.setAttribute("id", this.id);

        this.containerElement.setAttribute(
          "style",
          `position: fixed; top: 0; right: 0; font-size: 12px;`
        );
      }
    }

    clear() {
      if (this.containerElement) {
        this.containerElement.innerHTML = "";
      }
    }

    createPopup(parent) {
      const coverEl = document.createElement("div");

      const handleClose = () => {
        coverEl.remove();
      };

      coverEl.onclick = (e) => {
        handleClose();
      };

      coverEl.classList.add(`${this.id}_popup`);
      coverEl.setAttribute(
        "style",
        `
          position: fixed; top: 0; left: 0; 
          width: 100vw; height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center; 
          background: rgba(0,0,0,0.4);
        `
      );

      const contentEl = document.createElement("div");
      contentEl.onclick = (e) => {
        e.stopPropagation();
      };

      contentEl.classList.add(`${this.id}_popup-content`);
      contentEl.setAttribute(
        "style",
        `
          position: relative; 
          width: fit-content;
          padding: 2rem;
          max-width: 80vw;
          background: white;
          color: black;
        `
      );

      const contentCloseEl = document.createElement("span");
      contentCloseEl.setAttribute(
        "style",
        `
          position: absolute; 
          font-size: 0.8rem;
          padding: 0.2rem;
          right: 0;
          top: 0;
        `
      );
      contentCloseEl.innerText = "close";
      contentCloseEl.onclick = (e) => {
        handleClose();
      };
      contentEl.append(contentCloseEl);

      coverEl.append(contentEl);

      parent.append(coverEl);

      return contentEl;
    }

    createButton(parent, text, handler) {
      const el = document.createElement("button");

      el.classList.add(`${this.id}_button`);
      el.setAttribute(
        "style",
        `padding: 0.5em 2em; background: black; color: white;`
      );

      el.innerText = text;

      el.onclick = handler;

      parent.append(el);

      return el;
    }

    createText(parent, text) {
      const el = document.createElement("p");

      el.classList.add(`${this.id}_text`);

      el.innerText = text;

      parent.append(el);

      return el;
    }

    createForm(parent, fields, onSubmit) {
      const el = document.createElement("form");
      el.setAttribute(
        "style",
        `
          padding: 1rem;
          display: flex; flex-direction: column;
          gap: 1rem;
        `
      );

      el.classList.add(`${this.id}_form`);

      el.onsubmit = (e) => {
        e.preventDefault();

        const fieldNames = fields.map(({ field }) => field);
        const formData = new FormData(e.target);

        const data = fieldNames.reduce((res, field) => {
          return {
            ...res,
            [field]: formData.get(field),
          };
        }, {});

        onSubmit(e, data);
      };

      fields.forEach(({ field, defaultValue, ...other }) => {
        const fieldEl = document.createElement("input");

        fieldEl.setAttribute("name", field);
        fieldEl.setAttribute("id", field);

        if (defaultValue != null) {
          fieldEl.defaultValue = defaultValue;
        }

        Object.entries(other).forEach(([key, value]) => {
          fieldEl.setAttribute(key, value);
        });

        el.append(fieldEl);
      });

      this.createButton(el, "Submit");

      parent.append(el);

      return el;
    }

    createBitPopup(parent, { userToken, state }, onSubmit) {
      const popupContent = this.createPopup(parent);

      const fields = [
        {
          field: "email",
          type: "email",
          required: "required",
          placeholder: "Email",
          defaultValue: userToken?.email,
        },
        {
          field: "password",
          type: "password",
          required: "required",
          placeholder: "Password",
        },
        {
          field: "bid",
          type: "number",
          required: "required",
          placeholder: "Bid",
          defaultValue: state?.bid,
        },
      ];

      this.createForm(popupContent, fields, (e, data) => {
        onSubmit(data, (error) => {
          if (error) {
          } else {
            popupContent.parentElement.onclick();
          }
        });
      });
    }

    render({ sessionId, userToken, state }) {
      if (this.containerElement.parentNode == null) {
        document.body.append(this.containerElement);
      }

      this.clear();

      console.log(state);

      if (state == null) {
        return;
      }

      const userStatus = state.userState?.status || USER_STATUS_TYPES.draft;

      const handleSubmitBid = async (data, callback) => {
        console.log("bid form data", data);

        const user = await get(
          `users/search?email=${data.email}&password=${data.password}`
        )
          .then((res) => res.json())
          .then((res) => {
            setUserToken(res);
            return res;
          })
          .catch((err) => {
            callback(err.massage);

            return null;
          });

        if (user?.id) {
          post(`sessions/${sessionId}/bids`, null, {
            userId: user.id,
            value: data.bid,
            autoActivation: true,
          })
            .then((res) => {
              callback(null);
            })
            .catch((err) => {
              callback(err.massage);
            });
        }
      };

      const handleContestClick = this.createBitPopup.bind(
        this,
        this.containerElement,
        { userToken, state },
        handleSubmitBid
      );

      switch (state.status) {
        // session is not started
        case SESSION_STATUS_TYPES.draft: {
          switch (userStatus) {
            // user not logged or connected
            case USER_STATUS_TYPES.draft: {
              if (state.bid) {
                this.createText(
                  this.containerElement,
                  `current bid is ${state.bid}`
                );
              }

              this.createButton(this.containerElement, "contest", () =>
                handleContestClick()
              );
              break;
            }
            case USER_STATUS_TYPES.pending: {
              this.createText(
                this.containerElement,
                `waiting for ${state.bid || ""} response`
              );

              break;
            }
            case USER_STATUS_TYPES.request: {
              this.createText(
                this.containerElement,
                `current bid is ${state.bid}`
              );

              this.createButton(this.containerElement, "contest?", () =>
                handleContestClick()
              );
              break;
            }
            case USER_STATUS_TYPES.locked: {
              this.createText(
                this.containerElement,
                `${state.bid || ""} is locked`
              );

              break;
            }
            default: {
            }
          }
          break;
        }
        case SESSION_STATUS_TYPES.active: {
          switch (userStatus) {
            case USER_STATUS_TYPES.locked: {
              this.createText(
                this.containerElement,
                `${state.bid || ""} is locked`
              );

              break;
            }
          }
        }
        default: {
        }
      }
    }
  }

  class ContestClient {
    companyId;
    playerId;
    userId;
    connectionId;
    sessionId;

    userToken;

    state;
    active;

    ui;

    constructor() {
      this.companyId = COMPANY_ID;

      const token = getUserToken();

      if (token != null) {
        this.setKey("userToken", token);
      }

      this.ui = new UIComponent();
    }

    async connect(connectionId, playerId) {
      this.connectionId = connectionId;
      this.playerId = playerId;

      if (connectionId == null || playerId == null) {
        return false;
      }

      this.setKey("active", true);

      const body = {
        playerId: this.playerId,
        userId: this.userId,
        ownerId: COMPANY_ID,
      };

      const _state = await post(
        `connections/${connectionId}/participants`,
        null,
        body
      )
        .then((res) => res.json())
        .then((res) => {
          return res || null;
        })
        .catch((err) => {
          return null;
        });

      this.sessionId = _state?.id || null;

      this.setKey("state", _state);

      if (_state == null) {
        return;
      }

      this.sync();
    }

    setRecord(record) {
      const _callback = this.setKey;
      const entries = Object.entries(record);

      entries.forEach(([key, value]) => _callback(key, value));
    }

    setKey(key, value) {
      const hasChange = JSON.stringify(this[key]) !== JSON.stringify(value);

      this[key] = value;

      switch (key) {
        case "userToken": {
          if (value && value?.id) {
            this.userId = value.id;
          }

          break;
        }
        case "active": {
          this.render();
          break;
        }
        case "state": {
          if (!hasChange) {
            return;
          }

          this.render();

          if (value?.status != SESSION_STATUS_TYPES.closed) {
            this.sync();
          }
          break;
        }
        default: {
          break;
        }
      }
    }

    async sync() {
      const { userId, sessionId } = this;

      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }

      if (this.sessionId == null) {
        return;
      }

      const now = Date.now();
      const timePassed = this.lastRequest ? now - this.lastRequest : now;

      if (timePassed < 1000) {
        // connection error
        return;
      }

      this.lastRequest = now;

      const abortController = new AbortController();

      this.abortController = abortController;

      const _state = await get(
        `sessions/${sessionId}/listen?userId=${userId}`,
        {
          signal: abortController.signal,
        }
      )
        .then((res) => {
          if (res.status < 400) {
            return res.json();
          } else {
            return res;
          }
        })
        .catch((err) => {
          return null;
        });

      this.abortController = null;

      if (_state != null) {
        this.setKey("state", _state);
      } else {
        this.sync();
      }
    }

    json() {
      return Object.assign({}, this);
    }

    render() {
      if (this.state != null && this.active) {
        this.ui.render(this.json());
      } else {
        this.ui.clear();
      }
    }
  }

  let _contest = new ContestClient();

  try {
    window.Contest = {
      show: () => {
        _contest?.setKey("active", true);
      },
      hide: () => {
        _contest?.setKey("active", false);
      },
      connect: (connectionId, playerId) => {
        _contest.connect(connectionId, playerId);
      },
    };
  } catch (err) {}
})();
