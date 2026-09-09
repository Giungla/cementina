
import {
  // type DirectiveBinding,
  // ref,
  createApp,
  // shallowRef,
  defineComponent,
} from 'vue'

// import {
//   type OnCleanup,
// } from '@vue/reactivity'

import {
  payments as SquarePaymentInstance,
} from '@square/web-sdk'

const CheckoutComponent = defineComponent({
  name: 'CheckoutComponent',

  setup () {},

  data () {},

  created (): void {},

  methods: {
    async loadSquare () {
      const SquarePayment = await SquarePaymentInstance('app-id', 'location-id')

      if (!SquarePayment) return

      const SquarePaymentRequestSquarePayment = SquarePayment.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: {
          amount: '15.00',
          label: 'Square Payment',
        },
        requestBillingContact: true,
        requestShippingContact: true,
      })
    },
  },

  computed: {},

  watch: {},

  directives: {},
})

createApp(CheckoutComponent).mount('#orderform')

window.addEventListener('pageshow', ({ persisted }) => {
  if (persisted) location.reload()
})
