<template>
  <div>
    <nav class="horizontal"></nav>
    <nav class="vertical">
      <ul>
        <li>
          <a href="#">Pipeline</a>
        </li>
        <li>
          <router-link to="/main">Atividades</router-link>
        </li>
        <li>
          <a href="#">Empresas</a>
        </li>
        <li>
          <a href="#">Pessoas</a>
        </li>
        <li>
          <a href="#">Dashboard</a>
        </li>
        <li>
          <router-link @click="logout" to="/">Logout</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
  export default {
    methods: {
      logout() {
        //Limpa a localStorage do token e dados do usuário e destrói a sessão
        localStorage.clear();
        window.localStorage.removeItem('Token');
        window.localStorage.removeItem('userData');
        this.$session.destroy();
      }
    }
  };
</script>

<style scoped>
  .horizontal {
    background: #454545;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 5%;
  }

  .vertical {
    height: 100vh;
    width: 7%;
    position: fixed;
    top: 25px;
    left: 0;
    background-color: #454545; /* Black */
    overflow-x: hidden;
    padding-top: 20px;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  li a {
    display: block;
    color: #b8b8b8;
    padding: 9px 17px;
    text-decoration: none;
    font-size: 15px;
  }

  li a:hover {
    background-color: #333;
    color: #fcfcfc;
  }
</style>
