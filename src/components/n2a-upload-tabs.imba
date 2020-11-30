import {viewparam} from '../data/storage'

tag side-bar-item < li
	prop label
	prop slug

	<self .is-active=(viewparam() == slug)>
		<a @click.clickSideBar(slug)> label


tag n2a-upload-tabs
	<self .tabs .is-centered> <ul>
		<side-bar-item label="Upload" slug='upload'>
		<side-bar-item label="Template" slug='template'>
		<side-bar-item label="Deck" slug='deck-options'>
		<side-bar-item label="Card" slug='card-options'>