import '../components/locally-stored-checkbox'
import '../components/n2a-button'
import '../components/download-modal'
import '../components/n2a-side-bar'
import '../components/n2a-upload-form'
import '../components/centered-title'

import '../views/template-options'
import '../views/deck-options'
import '../views/card-options'

import {iget, iset, viewparam} from '../data/storage'
import {getCardTypes} from '../data/card-types'
					
tag upload-page

	prop edd = 'empty-deck-desc'
	prop fontSize = 20
	
	prop view = 'upload'

	def clickSideBar item		
		const path = "/upload?view={item}"
		view = item
		window.history.pushState({"view":item}, document.title, path)


	def setup
		# Make sure we get default value
		if not iget('default_set')
			const cardTypes = getCardTypes!
			for ct of cardTypes 
				iset(ct.type, ct.default)
			iset('default_set', true)
		view = viewparam() || 'upload'

	def render
		<self[d: block py: 4rem]>
			<.section>
				<.columns>
					<.column>
						<n2a-side-bar[p: 2rem]>
					<.column .is-half>
						switch view
							when 'upload'
								<n2a-upload-form>
							when 'deck-options'
								<deck-options>						
							when 'card-options'
								<card-options>
							when 'template'
								<template-options>
						<hr>
						<.has-text-centered>
							<h2.subtitle.is-2> "If you ever get stuck watch the videos below"						
							<p> "If you are busy, watch them in 2x speed and please SMASH the ♥️ LIKE button"
							<iframe width="560" height="315" src="https://www.youtube.com/embed/NLUfAWA2LJI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>						
							<iframe width="560" height="315" src="https://www.youtube.com/embed/BN5DTq2tbsY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>							
							<iframe width="560" height="315" src="https://www.youtube.com/embed/4PdhlNbBqXo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>							
					<.column>
						<div[bg: purple1 p: 2rem bd: 2.3px solid purple7 bs: inset]> "Join me live on 💜 Twitch every week! {<a[m: 2rem bdb: 3px solid #a970ff] target="_blank" href="https://www.twitch.tv/alemayhu"> "https://www.twitch.tv/alemayhu"}"