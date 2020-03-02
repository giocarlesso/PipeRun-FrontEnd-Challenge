<template>
  <div class="body">
    <div class="container">
      <form class="form" @submit.prevent="userLogin">
        <h1>Login</h1>

        <input
          class="inputFields"
          autocomplete="off"
          required
          v-model="email"
          type="text"
          placeholder="Email"
        />

        <input
          class="inputFields"
          autocomplete="off"
          required
          v-model="password"
          type="password"
          placeholder="Password"
        />

        <button>Login</button>
      </form>
    </div>
  </div>
</template>

<script>
  import Constants from '../logic/Constants.js';

  import axios from 'axios';

  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      userLogin() {
        axios
          .post(
            Constants.API_URL +
              '/auth?email=' +
              this.email +
              '&password=' +
              this.password
          )
          .then(response => {
            //Salvando a token e os dados do usuário logado na localStorage
            const userData = response.data.data.me;
            const token = userData.token;

            localStorage.setItem('Token', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            if (response.data.success === true) {
              this.$session.start();
              this.$router.push({
                name: 'Main'
              });
            }
          })
          .catch(err => {
            alert(
              'Ocorreu um erro no login. Por favor verifique suas credenciais e tente novamente.',
              err
            );
          });
      }
    }
  };
</script>

<style scoped>
  .body {
    width: 100vw;
    height: 100vh;
    background-color: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .container {
    position: absolute;
    width: 20%;
    padding: 20px 0;
    background: #fcfcfc;
    border-radius: 3px;
  }

  .form {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .form h1 {
    color: #8c898c;
    margin-bottom: 25px;
  }

  .form .inputFields {
    position: relative;
    padding: 10px;
    margin: 5px 5%;

    border: 1px solid #a6a6a6;
    border-radius: 3px;

    background: transparent;
    font-size: 16px;
  }

  .form button {
    position: relative;
    padding: 10px;
    margin: 20px 5% 0 5%;

    border: 1px solid #30bced;
    border-radius: 3px;

    background: #30bced;
    color: #fcfcfc;
    font-size: 16px;
  }

  .form button:hover {
    background: #289ac2;
  }
</style>
