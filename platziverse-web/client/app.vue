<template>
  <div>
    <agent uuid="d2190397-f5e1-4bca-a35c-4a25cad2c169" :socket="socket">

    </agent>

    <!-- <metric 
      type="promiseMetric" 
      uuid="4886061d-c7f8-4fe9-a033-34e5501db829"
      :socket="socket"> </metric> -->

    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
const io = require('socket.io-client')
const socket = io()

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    initialize () {
    }
  }
}
</script>
