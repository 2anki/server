import {viewparam} from '../data/storage'

tag side-bar-item < a
	prop label
	prop slug

	<self[bg: green3 fw: bold]=(viewparam() == slug)>
		<a @click.clickSideBar(slug)> label


tag n2a-side-bar < aside
	<self>
		<.menu>
			<p .menu-label> "Views"
			<ul .menu-list>
				<li>
					<side-bar-item label="Upload" slug='upload'>
					<side-bar-item label="Template" slug='template'>
					<side-bar-item label="Deck" slug='deck-options'>
					<side-bar-item label="Card" slug='card-options'>