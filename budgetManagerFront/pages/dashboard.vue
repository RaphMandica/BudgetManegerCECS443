<template>
  <div>
    <nav-bar></nav-bar>
    <div
      v-if="show"
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 flex items-end mt-12 px-4 py-6 sm:items-start sm:p-6"
    >
      <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
        <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
        <transition
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <ExclamationCircleIcon
                    class="h-6 w-6 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                  <p class="text-sm font-medium text-gray-900">Warning</p>
                  <p class="mt-1 text-sm text-gray-500">
                    You have reached {{ percentageBalance }}% of your budget
                  </p>
                </div>
                <div class="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    @click="show = false"
                    class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span class="sr-only">Close</span>
                    <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <div class="w-8/12 mx-auto">
      <dl
        class="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="stat in stats"
          :key="stat.name"
          class="flex flex-wrap rounded-lg items-baseline justify-evenly gap-x-4 gap-y-2 bg-white px-4 ml-1 py-10 sm:px-6 xl:px-8 shadow-xl shadow-blue-500/50"
        >
          <dt class="text-sm font-medium leading-6 text-gray-500">
            {{ stat.name }}
          </dt>
          <button v-if="stat.name === 'Balance'" @click="editState = true">
            Edit
          </button>
          <dd
            :class="[
              stat.changeType === 'negative'
                ? 'text-rose-600'
                : 'text-green-700',
              'text-xs font-medium',
            ]"
          >
            {{ stat.change }}
          </dd>
          <dd
            v-if="stat.name !== 'Balance'"
            class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900"
          >
            ${{ stat.value }}
          </dd>
          <dd
            v-if="stat.name === 'Balance'"
            class="w-full flex text-3xl font-medium leading-10 tracking-tight text-gray-900"
          >
            <div v-if="stat.name === 'Balance' && editState">
              <div className="relative mt-2 w-full rounded-md shadow-sm">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                >
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  name="price"
                  v-model="balance"
                  id="price"
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                  aria-describedby="price-currency"
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <span
                    className="text-gray-500 sm:text-sm"
                    id="price-currency"
                  >
                    USD
                  </span>
                </div>
              </div>
            </div>
            <button
              v-if="editState"
              class="ml-2"
              @click="(editState = false), updtadeBalance()"
            >
              V
            </button>
            <div v-if="stat.name === 'Balance' && !editState">
              ${{ balance }}
            </div>
          </dd>
        </div>
      </dl>
      <div class="h-full">
        <ul role="list" class="grid grid-raw-1 gap-6 mt-20">
          <li class="col-span-1 divide-y divide-gray-200">
            <div class="flex justify-between space-x-6 p-6">
              <div
                class="w-3/12 p-2 rounded-lg bg-white shadow-xl shadow-blue-500/50"
              >
                <add-expense :user="user"></add-expense>
              </div>
              <div
                class="w-auto rounded-lg bg-white shadow-xl shadow-blue-500/50"
              >
                <display-expenses></display-expenses>
              </div>
              <div class="rounded-lg bg-white shadow-xl shadow-blue-500/50">
                <chart-card></chart-card>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import addExpense from "../component/cards/add-expense.vue";
import displayExpenses from "../component/cards/display-expenses.vue";
import chartCard from "../component/cards/chart-card.vue";
import serviceApi from "../service/Api";
import { expenseStore } from "../stores/expenseStore";
import navBar from "../component/nav-bar.vue";
import notifications from "../component/notifications.vue";
import { ref } from "vue";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import Cookies from 'js-cookie'

const people = {
  name: "Jane Cooper",
  title: "Regional Paradigm Technician",
  role: "Admin",
  email: "janecooper@example.com",
  telephone: "+1-202-555-0170",
  imageUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
};

const store = expenseStore();

export default {
  middleware: 'auth',
  components: {
    draggable,
    addExpense,
    displayExpenses,
    chartCard,
    navBar,
    notifications,
    ref,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
  },
  data: () => {
    return {
      editState: false,
      stats: {},
      key: store.expsType,
      drag: false,
      people,
      balance: 0,
      show: false,
    };
  },
  methods: {
    updtadeBalance() {
      serviceApi
        .post(
          "/api/user/me",
          { Balance: this.balance },
          {
            headers: {
              Authorization: `Bearer ${store.token}`,
            },
          }
        )
        .then((response) => {
          this.user = response.data;
          (this.user);
          store.user.Balance = response.data.Balance;
        });
    },
  },

  computed: {
    stats(): any {
      return [
        {
          name: "Expenses",
          value: store.user.totalExpenses,
          change: "",
          changeType: "positive",
        },
        {
          name: "Balance",
          value: store.user.Balance,
          change: "",
          changeType: "negative",
        },
        {
          name: "Spend Today",
          value: this.spentToday,
          change: "",
          changeType: "positive",
        },
        {
          name: "Rest to balance",
          value: this.balance - store.user.totalExpenses,
          change: this.percentageBalance + "%",
          changeType:
            parseInt(this.percentageBalance) < 80 ? "positive" : "negative",
        },
      ];
    },
    percentageBalance() {
      const res =
        this.balance !== 0
          ? ((parseInt(store.user.totalExpenses) / this.balance) * 100).toFixed(
              2
            )
          : "N/A";
      if (parseInt(res) >= 80) {
        this.show = true;
      } else {
        this.show = false;
      }
      return res;
    },
    spentToday(): Number {
      return store.spentToday;
    },
  },

  created() {
    serviceApi
      .get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      })
      .then((data) => {
        store.user = data.data;
        this.balance = data.data.Balance;
        store.userExpense = data.data.userExpense;
        store.calculExpenseType();
        store.calculTotalExpense();
      });
  },
};
</script>
