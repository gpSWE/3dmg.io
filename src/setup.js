import * as THREE from "three"

const setup = () => {

	const scene = new THREE.Scene()

	const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 60_000 )
	camera.up = new THREE.Vector3( 0, 0, 1 )
	camera.position.set( 0, 0, 200 )

	const renderer = new THREE.WebGLRenderer( {
		alpha: true,
		antialias: true,
	} )

	renderer.setPixelRatio( window.devicePixelRatio )

	document.body.insertBefore( renderer.domElement, document.body.firstElementChild )

	const onResize = () => {

		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		renderer.setSize( window.innerWidth, window.innerHeight )
	}

	onResize()

	window.addEventListener( "resize", onResize, false )

	//

	scene.add( new THREE.AxesHelper( 1000 ) )

	{
		const light = new THREE.DirectionalLight( 0xffffff, 0.5 )
		light.position.set( 50, 50, 50 )
		scene.add( light )
	}

	{
		const light = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 )
		light.position.set( 50, 50, 100 )
		scene.add( light )
	}

	{
		const light = new THREE.AmbientLight( 0xffffff, 0.25 )
		light.position.set( 50, 50, 100 )
		scene.add( light )
	}

	// default

	renderer.setAnimationLoop( () => renderer.render( scene, camera ) )

	return {
		scene,
		camera,
		renderer,
	}
}

export {
	setup,
}
