
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Button.svelte generated by Svelte v3.44.2 */

    const file$1 = "src\\Button.svelte";

    function create_fragment$1(ctx) {
    	let button_1;
    	let t;
    	let button_1_class_value;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			t = text(/*name*/ ctx[2]);
    			attr_dev(button_1, "class", button_1_class_value = "button " + (/*span*/ ctx[1] ? 'span-two' : ''));
    			add_location(button_1, file$1, 7, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, t);
    			/*button_1_binding*/ ctx[4](button_1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 4) set_data_dev(t, /*name*/ ctx[2]);

    			if (dirty & /*span*/ 2 && button_1_class_value !== (button_1_class_value = "button " + (/*span*/ ctx[1] ? 'span-two' : ''))) {
    				attr_dev(button_1, "class", button_1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			/*button_1_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { span } = $$props;
    	let { name } = $$props;
    	let { type } = $$props;
    	let { button = '' } = $$props;
    	const writable_props = ['span', 'name', 'type', 'button'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('span' in $$props) $$invalidate(1, span = $$props.span);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('button' in $$props) $$invalidate(0, button = $$props.button);
    	};

    	$$self.$capture_state = () => ({ span, name, type, button });

    	$$self.$inject_state = $$props => {
    		if ('span' in $$props) $$invalidate(1, span = $$props.span);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('button' in $$props) $$invalidate(0, button = $$props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [button, span, name, type, button_1_binding];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { span: 1, name: 2, type: 3, button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*span*/ ctx[1] === undefined && !('span' in props)) {
    			console.warn("<Button> was created without expected prop 'span'");
    		}

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<Button> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[3] === undefined && !('type' in props)) {
    			console.warn("<Button> was created without expected prop 'type'");
    		}
    	}

    	get span() {
    		return this.$$.ctx[1];
    	}

    	set span(span) {
    		this.$$set({ span });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[2];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}

    	get type() {
    		return this.$$.ctx[3];
    	}

    	set type(type) {
    		this.$$set({ type });
    		flush();
    	}

    	get button() {
    		return this.$$.ctx[0];
    	}

    	set button(button) {
    		this.$$set({ button });
    		flush();
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (135:2) {#each buttons as data, i}
    function create_each_block(ctx) {
    	let button;
    	let i = /*i*/ ctx[15];
    	let current;
    	const button_spread_levels = [/*data*/ ctx[13]];
    	const assign_button = () => /*button_binding*/ ctx[4](button, i);
    	const unassign_button = () => /*button_binding*/ ctx[4](null, i);
    	let button_props = {};

    	for (let i = 0; i < button_spread_levels.length; i += 1) {
    		button_props = assign(button_props, button_spread_levels[i]);
    	}

    	button = new Button({ props: button_props, $$inline: true });
    	assign_button();

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[15]) {
    				unassign_button();
    				i = /*i*/ ctx[15];
    				assign_button();
    			}

    			const button_changes = (dirty & /*buttons*/ 1)
    			? get_spread_update(button_spread_levels, [get_spread_object(/*data*/ ctx[13])])
    			: {};

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_button();
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(135:2) {#each buttons as data, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let current;
    	let each_value = /*buttons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "prev-op");
    			add_location(div0, file, 131, 3, 4822);
    			attr_dev(div1, "class", "curr-op");
    			add_location(div1, file, 132, 3, 4872);
    			attr_dev(div2, "class", "output");
    			add_location(div2, file, 130, 2, 4798);
    			attr_dev(div3, "class", "calcy-grid rounded");
    			add_location(div3, file, 129, 1, 4763);
    			add_location(main, file, 128, 0, 4755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			/*div0_binding*/ ctx[2](div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[3](div1);
    			append_dev(div3, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttons*/ 1) {
    				each_value = /*buttons*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*div0_binding*/ ctx[2](null);
    			/*div1_binding*/ ctx[3](null);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	class Calculator {
    		constructor(prevop, currop) {
    			this.prevopte = prevop;
    			this.curropte = currop;
    			this.currop = '';
    			this.prevop = '';
    			this.operation = '';
    			this.clear();
    		}

    		clear() {
    			this.currop = '';
    			this.prevop = '';
    			this.operation = '';
    		}

    		delete() {
    			this.currop = this.currop.toString().slice(0, -1);
    		}

    		appendnum(num) {
    			if (num === '.' && this.currop.includes('.')) return;
    			this.currop = this.currop.toString() + num.toString();
    		}

    		chooseop(op) {
    			if (this.currop === '') return;

    			if (this.prevop !== '') {
    				this.compute();
    			}

    			this.operation = op;
    			this.prevop = this.currop;
    			this.currop = '';
    		}

    		compute() {
    			let computation;
    			const prev = parseFloat(this.prevop);
    			const curr = parseFloat(this.currop);
    			if (isNaN(prev) || isNaN(curr)) return;

    			switch (this.operation) {
    				case '+':
    					computation = prev + curr;
    					break;
    				case '-':
    					computation = prev - curr;
    					break;
    				case '*':
    					computation = prev * curr;
    					break;
    				case '/':
    					computation = prev / curr;
    					break;
    				default:
    					return;
    			}

    			this.currop = computation;
    			this.operation = '';
    			this.prevop = '';
    		}

    		getDisNum(num) {
    			const stringnum = num.toString();
    			const intdig = parseFloat(stringnum.split('.')[0]);
    			const decdig = parseFloat(stringnum.split('.')[1]);
    			let intdis;

    			if (isNaN(intdig)) {
    				intdis = '';
    			} else {
    				intdis = intdig.toLocaleString('en', { aximumFractionDigits: 0 });
    			}

    			if (!isNaN(decdig)) {
    				return `${intdis}.${decdig}`;
    			} else {
    				return `${intdis}`;
    			}
    		}

    		updateDisplay() {
    			this.curropte.innerText = this.getDisNum(this.currop);
    			this.prevopte.innerText = `${this.operation.length !== 0 ? this.prevop : ''}${this.operation.length !== 0 ? ' ' + this.operation : ''}`;
    		}
    	}

    	let buttons = [
    		{
    			"name": "AC",
    			"span": true,
    			"type": "function.AC"
    		},
    		{
    			"name": "DEL",
    			"span": false,
    			"type": "function.DEL"
    		},
    		{
    			"name": "/",
    			"span": false,
    			"type": "operator"
    		},
    		{
    			"name": "1",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "2",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "3",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "*",
    			"span": false,
    			"type": "operator"
    		},
    		{
    			"name": "4",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "5",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "6",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "+",
    			"span": false,
    			"type": "operator"
    		},
    		{
    			"name": "7",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "8",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "9",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "-",
    			"span": false,
    			"type": "operator"
    		},
    		{
    			"name": ".",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "0",
    			"span": false,
    			"type": "number"
    		},
    		{
    			"name": "=",
    			"span": true,
    			"type": "function.EQ"
    		}
    	];

    	var numberbuttons;
    	var operators;
    	var equalsbutton;
    	var allclearbutton;
    	var delbutton;
    	const ops = [];
    	var currop;
    	var prevop;

    	onMount(async () => {
    		numberbuttons = buttons.filter(b => b.type === "number");
    		operators = buttons.filter(b => b.type === "operator");
    		equalsbutton = buttons.find(b => b.type === "function.EQ");
    		allclearbutton = buttons.find(b => b.type === "function.AC");
    		delbutton = buttons.find(b => b.type === "function.DEL");
    		prevop = ops[0];
    		currop = ops[1];
    		const calcy = new Calculator(prevop, currop);

    		numberbuttons.forEach(button => {
    			button.button.addEventListener('click', _ => {
    				calcy.appendnum(button.name);
    				calcy.updateDisplay();
    			});
    		});

    		operators.forEach(button => {
    			button.button.addEventListener('click', _ => {
    				calcy.chooseop(button.name);
    				calcy.updateDisplay();
    			});
    		});

    		equalsbutton.button.addEventListener('click', _ => {
    			calcy.compute();
    			calcy.updateDisplay();
    		});

    		allclearbutton.button.addEventListener('click', _ => {
    			calcy.clear();
    			calcy.updateDisplay();
    		});

    		delbutton.button.addEventListener('click', _ => {
    			calcy.delete();
    			calcy.updateDisplay();
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ops[0] = $$value;
    			$$invalidate(1, ops);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ops[1] = $$value;
    			$$invalidate(1, ops);
    		});
    	}

    	function button_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			buttons[i] = $$value;
    			$$invalidate(0, buttons);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		onMount,
    		Calculator,
    		buttons,
    		numberbuttons,
    		operators,
    		equalsbutton,
    		allclearbutton,
    		delbutton,
    		ops,
    		currop,
    		prevop
    	});

    	$$self.$inject_state = $$props => {
    		if ('buttons' in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ('numberbuttons' in $$props) numberbuttons = $$props.numberbuttons;
    		if ('operators' in $$props) operators = $$props.operators;
    		if ('equalsbutton' in $$props) equalsbutton = $$props.equalsbutton;
    		if ('allclearbutton' in $$props) allclearbutton = $$props.allclearbutton;
    		if ('delbutton' in $$props) delbutton = $$props.delbutton;
    		if ('currop' in $$props) currop = $$props.currop;
    		if ('prevop' in $$props) prevop = $$props.prevop;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttons, ops, div0_binding, div1_binding, button_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
