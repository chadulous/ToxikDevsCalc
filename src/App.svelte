<script lang="ts">
	import Button from "./Button.svelte";
	import { onMount } from 'svelte';
	class Calculator {
		constructor(prevop, currop) {
			this.prevopte = prevop
			this.curropte = currop
			this.currop = ''
			this.prevop = ''
			this.operation = ''
			this.clear()
		}
		clear() {
			this.currop = ''
			this.prevop = ''
			this.operation = ''
		}
		delete() {
			this.currop = this.currop.toString().slice(0, -1)
		}
		appendnum(num) {
			if(num==='.'&&this.currop.includes('.'))return
			this.currop = this.currop.toString() + num.toString()
		}
		chooseop(op) {
			if(this.currop==='')return
			if(this.prevop!=='') {
				this.compute()
			}
			this.operation = op
			this.prevop = this.currop
			this.currop = ''
		}
		compute() {
			let computation
			const prev = parseFloat(this.prevop)
			const curr = parseFloat(this.currop)
			if(isNaN(prev) || isNaN(curr)) return
			switch (this.operation) {
				case '+':
					computation = prev + curr
					break
				case '-':
					computation = prev - curr
					break
				case '*':
					computation = prev * curr
					break
				case '/':
					computation = prev / curr
					break
				default:
					return
			}
			this.currop = computation
			this.operation = ''
			this.prevop = ''
		}
		getDisNum(num) {
			const stringnum = num.toString()
			const intdig = parseFloat(stringnum.split('.')[0])
			const decdig = parseFloat(stringnum.split('.')[1])
			let intdis
			if(isNaN(intdig)) {
				intdis = ''
			} else {
				intdis = intdig.toLocaleString('en', { aximumFractionDigits: 0})
			}
			if(!isNaN(decdig)) {
				return `${intdis}.${decdig}`
			} else {
				return `${intdis}`
			}
		}
		updateDisplay() {
			this.curropte.innerText = this.getDisNum(this.currop)
			this.prevopte.innerText = `${this.operation.length!==0?this.prevop:''}${this.operation.length!==0? ' ' + this.operation:''}`
		}
	}
	let buttons = [{"name":"AC","span":true,"type":"function.AC"}, {"name":"DEL","span":false,"type":"function.DEL"}, {"name":"/","span":false,"type":"operator"},{"name":"1","span":false,"type":"number"},{"name":"2","span":false,"type":"number"},{"name":"3","span":false,"type":"number"},{"name":"*","span":false,"type":"operator"},{"name":"4","span":false,"type":"number"},{"name":"5","span":false,"type":"number"},{"name":"6","span":false,"type":"number"},{"name":"+","span":false,"type":"operator"},{"name":"7","span":false,"type":"number"},{"name":"8","span":false,"type":"number"},{"name":"9","span":false,"type":"number"},{"name":"-","span":false,"type":"operator"},{"name":".","span":false,"type":"number"},{"name": "0","span":false,"type":"number"},{"name":"=","span":true,"type":"function.EQ"}];
	var numberbuttons
	var operators
	var equalsbutton
	var allclearbutton
	var delbutton
	const ops = [];
	var currop
	var prevop
	onMount(async ()=>{
			numberbuttons = buttons.filter(b=>b.type==="number");
			operators = buttons.filter(b=>b.type==="operator");
			equalsbutton = buttons.find(b=>b.type==="function.EQ");
			allclearbutton = buttons.find(b=>b.type==="function.AC");
			delbutton = buttons.find(b=>b.type==="function.DEL");
			prevop = ops[0];
			currop = ops[1];
			const calcy: Calculator = new Calculator(prevop, currop)
			numberbuttons.forEach(button => {
				button.button.addEventListener('click', _=>{
					calcy.appendnum(button.name)
					calcy.updateDisplay()
				})
			});
			operators.forEach(button => {
				button.button.addEventListener('click', _=>{
					calcy.chooseop(button.name)
					calcy.updateDisplay()
				})
			});
			equalsbutton.button.addEventListener('click', _=>{
				calcy.compute()
				calcy.updateDisplay()
			})
			allclearbutton.button.addEventListener('click', _=>{
				calcy.clear()
				calcy.updateDisplay()
			})
			delbutton.button.addEventListener('click', _=>{
				calcy.delete()
				calcy.updateDisplay()
			})
	})
</script>

<main>
	<div class="calcy-grid rounded">
		<div class="output">
			<div class="prev-op" bind:this={ops[0]}></div>
			<div class="curr-op" bind:this={ops[1]}></div>
		</div>
		{#each buttons as data, i}
		<Button {...data} bind:this={buttons[i]}></Button>
		{/each}
	</div>
</main>

<style global lang="postcss">
	@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	.calcy-grid {
		display: grid;
		justify-content: center;
		align-content: center;
		min-height: 100vh;
		grid-template-columns: repeat(4, 100px);
		grid-template-rows: minmax(120px, auto) repeat(5, 100px);
	}
	.output {
		grid-column: 1 / -1;
		background-color: rgba(0, 0, 0, .75);
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-direction: column;
		padding: 10px;
		word-wrap: break-word;
		word-break: break-all;
	}
	.prev-op {
		color: rgba(255, 255, 255, .75);
		font-size: 1.5rem;
	}
	.curr-op {
		color: white;
		font-size: 2.5rem;
	}
	.button {
		margin: 0;
		cursor: pointer;
		font-size: 2rem;
		border: 1px solid white;
		outline: none;
		transition-property: background-color, border-color, border;
		transition-duration: 0.5s;
		transition-timing-function: ease-in-out;
		background-color: rgba(255, 255, 255, .75);
	}
	.button:hover {
		outline: none;
		border: 1px solid white;
		background-color: rgba(255, 255, 255, .9);
	}
	.button:focus {
		border: 1px solid white;
		border-color: rgba(100, 0, 0, .75) !important;
		outline: none;
	}
	.button::not(:focus) {
		border: 1px solid white;
	}
	.span-two {
		grid-column: span 2;
	}
	*:not(.output), *:not(.output > *) {
		user-select: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}
	*, *::before, *::after {
		box-sizing: border-box;
		font-family: 'Varela Round', sans-serif;
		font-weight: normal;
		outline: none;
	}
	body {
		padding: 0;
		margin: 0;
		background: linear-gradient(-45deg, #00AAFF 0%, #00FF6C 100%)
	}
</style>