export default function getTemplateRender( { fragment, bindings, clean } ) {
	
	const nodes = getBoundNodes( fragment );
	initNodes( nodes, bindings );

	return function templateRender() {
		const node = fragment.cloneNode( true );
		const nodes = getBoundNodes( node );
		const queue = queueNodesAndBindings( nodes, bindings, clean );
		return { node, queue };
	}
}

function getBoundNodes( fragment, bindings, method ) {
	return fragment.querySelectorAll( '[data-bind]' );
}

function initNodes( nodes, bindings ) {
	for( var i = 0, l = nodes.length, node, binding; i < l; i++ ) {
		node = nodes[i];
		// list = node.dataset.bind.split( ',' );
		
		binding = bindings[ node.dataset.bind ];
		if ( binding && binding.init ) {
			binding.init( node );
		}
			
		// for ( var b = 0, bl = list.length, binding; b < bl; b++ ) {
		// 	binding = bindings[ list[b] ];
		// 	if ( binding ) {
		// 		binding.init( node );
		// 	}
		// }
	}	
}

function queueNodesAndBindings( nodes, bindings, clean ) {
	const l = nodes.length;
	const queue = [];
	
	for( var i = 0, node, binding; i < l; i++ ) {
		node = nodes[i];
		// list = node.dataset.bind.split( ',' );
		
		binding = bindings[ node.dataset.bind ];
		
		if ( !binding ) throw new Error( `unrecognized binding ${node.dataset.bind}` );
		
		queue.push( { node, binding } );
		
		// for ( var b = 0, bl = list.length, binding; b < bl; b++ ) {
		// 	binding = bindings[ list[b] ];
		// 	if ( binding ) {
		// 		queue.push( { node, binding } );
		// 	}
		// }
		
		// TODO: make optional, adds a ms or so
		node.removeAttribute( 'data-bind' );
	}	
	
	return queue;
}
