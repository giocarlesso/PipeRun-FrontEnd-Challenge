<template>
  <div>
    <navigation></navigation>
    <div class="act-container">
      <button class="btn-primary" @click="showFormActivity">
        Adicionar Nova Atividade
      </button>
      <button class="btn-secondary" @click="showFilters">Filtrar</button>
      <form
        class="form-activity"
        v-if="showForm"
        @submit.prevent="sendActivity"
      >
        <div class="form-separator">
          <input
            required
            type="text"
            placeholder="Nome da Atividade"
            v-model="title"
          />

          <select v-model="owner" required>
            <option value="" disabled>Responsável</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{
              user.name
            }}</option>
          </select>

          <select v-model="activityType" required>
            <option value="" disabled>Tipo</option>
            <option v-for="type in types" :key="type.id" :value="type.id">{{
              type.name
            }}</option>
          </select>

          <input required type="text" placeholder="Status" v-model="status" />

          <button class="btn-primary add">Enviar</button>
        </div>
      </form>
      <div class="filter" v-if="showDatePickers">
        <div class="div-datepicker">
          <datepicker
            class="datepicker"
            placeholder="Data Inicial"
            v-model="datePickerFromDate"
          ></datepicker>
        </div>
        <div class="div-datepicker">
          <datepicker
            class="datepicker dt-final"
            placeholder="Data Final"
            v-model="datePickerToDate"
          ></datepicker>
        </div>

        <button class="btn-secondary" @click="getActivityList">Filtrar</button>
        <button class="btn-danger" @click="deleteFilters">
          Cancelar Filtro
        </button>
      </div>

      <table class="table">
        <thead>
          <th>Título</th>
          <th>Responsável</th>
          <th>Status</th>
          <th>Tipo</th>
          <th>Criada</th>
          <th>Finalizada</th>
          <th>Opções</th>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td>{{ activity.title }}</td>
            <td>{{ getUserName(activity.owner_id) }}</td>
            <td>{{ activity.status }}</td>
            <td>{{ getType(activity.activity_type) }}</td>
            <td>{{ formatDate(activity.created_at) }}</td>
            <td>{{ formatDate(activity.delivery_date) }}</td>
            <td>
              <button
                v-if="activity.status !== 2"
                @click="finishActivity(activity)"
              >
                Concluir
              </button>
              <button @click="updateActivity(activity)">
                Editar
              </button>
              <button @click="deleteActivity(activity.id)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <nav class="pagination">
        <ul>
          <li>
            <button
              v-for="(pageNumber, index) in pages"
              :key="index"
              @click="setPageNumber(pageNumber)"
            >
              {{ pageNumber }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
  import Constants from '../logic/Constants.js';

  import navigation from '../components/Navigation';

  import axios from 'axios';

  import moment from 'moment';

  import datepicker from 'vuejs-datepicker';

  export default {
    components: { navigation, datepicker },

    data() {
      return {
        activities: [],
        totalNumberOfActivities: '',
        users: [],
        types: [],
        showForm: false,
        showDatePickers: false,
        title: '',
        owner: '',
        activityType: '',
        status: '',
        updatedFields: {},
        currentActivityId: null,
        userData: JSON.parse(localStorage.getItem('userData')),
        datePickerFromDate: null,
        datePickerToDate: null,
        page: 1,
        perPage: 10,
        pages: []
      };
    },

    methods: {
      /* Pega o número total de atividades que o usuário tem na sua conta e chama o método para calcular quantas páginas o navegador de páginas deve ter*/
      getTotalActivities() {
        axios
          .get(Constants.API_URL + '/activities', {
            headers: {
              'Content-Type': 'application/json',
              Token: localStorage.getItem('Token')
            }
          })
          .then(response => {
            this.totalNumberOfActivities = response.data.data.length;
          })
          .then(() => {
            this.setPages();
          });
      },

      /* Calcula a quantidade de links para páginas que devem ser mostrados abaixo da tabela, permitindo a paginação e navegação do usuário para qualquer página baseando-se no número total de atividades que exitem na conta logada */
      setPages() {
        this.pages = [];
        let numberOfPages = Math.ceil(
          this.totalNumberOfActivities / this.perPage
        );
        for (let index = 1; index <= numberOfPages; index++) {
          this.pages.push(index);
        }
      },

      /* Salva o número da página clicado pelo usuário na navegação abaixo da tabela */
      setPageNumber(number) {
        this.page = number;
        this.getActivityList();
      },

      /* Busca na API a lista de atividades com os parametros de paginação selecionados */
      getActivityList() {
        axios
          .get(
            Constants.API_URL +
              '/activities?page=' +
              this.page +
              '&show=' +
              this.perPage,
            {
              headers: {
                'Content-Type': 'application/json',
                Token: localStorage.getItem('Token')
              }
            }
          )
          .then(response => {
            /* Detecta se o usuário escolheu alguma data nos datepickers do template. */

            if (this.datePickerFromDate && this.datePickerToDate != null) {
              let unfilteredActivities = response.data.data;

              /* Formata as datas escolhida nos datepickers pelo usuário para, posteriormente, comparar com a data que vem na resposta da API*/
              let dateFrom = this.datePickerFromDate.toISOString();
              let dateTo = this.datePickerToDate.toISOString();

              /* Reseta a lista de atividades para evitar erros relacionados a respostas de requests anteriores */
              this.activities = [];

              /* Adiciona na array de atividades apenas as que se encaixam no filtro escolhido
              moment.js possui queries que facilitam essa comparação */
              for (let i = 0; i < unfilteredActivities.length; i++) {
                if (
                  moment(unfilteredActivities[i].created_at).isSameOrAfter(
                    moment(dateFrom),
                    'day'
                  ) &&
                  moment(unfilteredActivities[i].created_at).isSameOrBefore(
                    moment(dateTo),
                    'day'
                  )
                ) {
                  this.activities.push(unfilteredActivities[i]);
                }
              }
            } else {
              /* Caso o usuário não tenha escolhido nenhuma data no datepicker, todas as atividades da resposta da API vão para a lista, com seus respectivos parâmetros de paginação */
              this.activities = response.data.data;
            }
          })
          .then(() => this.setPages());
      },

      /* Recebe a lista de usuários vindo da API*/
      getUsers() {
        axios
          .get(Constants.API_URL + '/users', {
            headers: {
              'Content-Type': 'application/json',
              Token: localStorage.getItem('Token')
            }
          })
          .then(response => {
            this.users = response.data.data;
          });
      },

      /* Retorna o nome do usuário dono da atividade atual baseado no owner_id que vem da API e do id na lista de usuários */
      getUserName(owner_id) {
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i].id === owner_id) {
            return this.users[i].name;
          } else {
            return 'Usuário não encontrado';
          }
        }
      },

      /* Recebe a lista de tipos de atividades vindo da API*/
      getTypes() {
        axios
          .get(Constants.API_URL + '/activityTypes', {
            headers: {
              'Content-Type': 'application/json',
              Token: localStorage.getItem('Token')
            }
          })
          .then(response => {
            this.types = response.data.data;
          });
      },
      /* Retorna o nome do tipo da atividade atual baseado no id do tipo que vem da API e do id na lista de tipos */
      getType(activity_type) {
        for (let i = 0; i < this.types.length; i++) {
          if (this.types[i].id === activity_type) {
            return this.types[i].name;
          } else {
            return 'Tipo Desconhecido';
          }
        }
      },

      /* Apenas controla se o form é visível*/
      showFormActivity() {
        this.showForm = !this.showForm;
      },

      /* Apenas controla se  os filtros são visíveis*/
      showFilters() {
        this.showDatePickers = !this.showDatePickers;
      },

      /* Envia as atividades novas ou editadas para a API*/
      sendActivity() {
        let dataFields = {
          account_id: this.userData.id,
          owner_id: this.userData.id,
          title: this.title,
          activity_type: this.activityType,
          status: this.status,
          priority: 1,
          created_at: moment().format()
        };

        /* Faz um merge dos objetos que contém as propriedades obrigatórias de envio
        Caso a atividade enviada seja um update, as propriedades que se repetem serão as da activity atualizada */
        let objectToSend;
        objectToSend = { ...this.updatedFields, ...dataFields };
        objectToSend = JSON.stringify(objectToSend);

        let requestMethod;
        let newURL;

        /* Identifica o método e a URL que devem ser enviadas para a API detectando se existe um ID de actividade(que vem do template) guardado ou não pois o formulário e botão de enviar são os mesmos
        Se o ID existir é um update. Se não uma nova atividade*/
        if (this.currentActivityId === null) {
          requestMethod = 'post';
          newURL = Constants.API_URL + '/activities';
        } else {
          requestMethod = 'put';
          newURL =
            Constants.API_URL + '/activities' + '/' + this.currentActivityId;
        }
        axios({
          method: requestMethod,
          url: newURL,
          data: objectToSend,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Token: localStorage.getItem('Token')
          }
        }).then(() => {
          /* Reseta os campos após adição ou edição e atualiza as listas de atividades */
          this.getTotalActivities();
          this.getActivityList();

          this.owner = null;
          this.status = '';
          this.title = '';
          this.currentActivityId = null;
          this.showForm = false;
          this.updatedFields = '';
        });
      },

      updateActivity(activity) {
        this.showFormActivity();
        this.title = activity.title;
        this.owner = this.getUserName(activity.owner_id);
        this.status = activity.status;
        this.currentActivityId = activity.id;
        this.updatedFields = {
          owner_id: JSON.parse(this.userData.id),
          title: this.title,
          activity_type: this.activityType,
          status: this.status,
          created_at: activity.created_at
        };
      },

      /* Formata a data para a versão brasileira afim de mostrar na tela mais amigavelmente usando as ferramentas do moment.js*/
      formatDate(data) {
        if (data) {
          moment.locale('pt-br');
          return moment(data).format('dddd, Do [de] MMMM [de] YYYY');
        } else {
          return '';
        }
      },

      /* Deleta a atividade com o a ID correspondente e atualiza as listas de atividades */
      deleteActivity(id) {
        axios
          .delete(Constants.API_URL + '/activities/' + id, {
            headers: {
              'Content-Type': 'application/json',
              Token: localStorage.getItem('Token')
            }
          })
          .then(() => {
            this.getTotalActivities();
            this.getActivityList();
          });
      },

      /* Finaliza a atividade com o ID correspondente e atualiza as listas de atividades*/
      finishActivity(activity) {
        let finishedActivity = {
          account_id: activity.account_id,
          owner_id: activity.owner_id,
          title: activity.title,
          activity_type: activity.activity_type,
          status: 2,
          priority: 1,
          created_at: activity.created_at,
          delivery_date: moment().format()
        };
        finishedActivity = JSON.stringify(finishedActivity);

        axios
          .put(
            Constants.API_URL + '/activities/' + activity.id,
            finishedActivity,
            {
              headers: {
                'Content-Type': 'application/json',
                Token: localStorage.getItem('Token')
              }
            }
          )
          .then(() => {
            this.getActivityList();
          });
      },
      /* Exclui os filtros selecionados caso o usuário decida não filtrar nada */
      deleteFilters() {
        this.datePickerFromDate = null;
        this.datePickerToDate = null;
        this.showDatePickers = false;
        this.getActivityList();
      }
    },

    created() {
      this.getTotalActivities();
      this.getActivityList();
      this.getUsers();
      this.getTypes();
    }
  };
</script>

<style>
  .table {
    border: 1px solid #191919;
    border-collapse: collapse;
    width: 99%;
    margin-top: 15px;
  }

  th {
    height: 40px;
    border: 1px solid #191919;
    text-align: center;
    height: 40px;
    padding: 0 5px 0 5px;
    background-color: #f5f5f6;
  }

  td {
    border-right: 1px solid #191919;
    border-bottom: 1px solid #191919;
    height: 35px;
  }

  tfoot td {
    border: none;
  }

  .table button {
    width: 33%;
  }

  .act-container {
    margin: 3% 0 0 8%;
  }

  .form-separator {
    padding: 15px 0;
    margin-left: -5px;
  }

  .form-separator input,
  .form-separator select {
    margin-left: 5px;
    height: 40px;
    width: 15.4%;
    box-sizing: border-box;
    border: 1px solid #a9a9a8;
    border-radius: 3px;
    color: #191919;
  }

  .btn-primary {
    background: #28a745;
    border: #28a745;
    color: #ffffff;
    width: 15.4%;
    border-radius: 3px;
    height: 40px;
  }
  .add {
    margin-left: 5px;
  }

  .btn-primary:hover {
    background: #17702b;
  }

  .btn-secondary {
    background: #6c757d;
    border: #6c757d;
    margin-left: 5px;
    color: #ffffff;
    width: 15.4%;
    border-radius: 3px;
    height: 40px;
  }

  .btn-secondary:hover {
    background: #282b2e;
  }

  .btn-danger {
    background: #dc3545;
    border: #dc3545;
    margin-left: 5px;
    color: #ffffff;
    width: 15.4%;
    border-radius: 3px;
    height: 40px;
  }

  .btn-danger {
    background: #c82333;
    border: #c82333;
    margin-left: 5px;
    color: #ffffff;
    width: 15.4%;
    border-radius: 3px;
    height: 40px;
  }

  .btn-danger:hover {
    background: #a41d2a;
  }

  .filter {
    margin-top: 15px;
  }

  .div-datepicker {
    float: left;
  }

  .vdp-datepicker input {
    height: 40px;
    width: 191.13px;
    border-radius: 3px;
    border: 1px solid #a9a9a8;
  }

  .dt-final {
    margin-left: 5px;
  }

  .pagination {
    margin-top: 15px;
    text-align: center;
  }

  ::placeholder {
    color: #191919;
    opacity: 1;
  }

  .pagination ul {
    margin: 10px 0;
    padding: 0;
  }
  .pagination li {
    list-style-type: none;
  }

  .pagination button {
    border: 1px solid #ddd;
  }
</style>
