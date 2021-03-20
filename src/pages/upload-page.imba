import '../components/input/locally-stored-checkbox'
import '../components/n2a-button'
import '../components/download-modal'
import '../components/n2a-upload-tabs'
import '../components/n2a-upload-form'
import '../components/centered-title'

import '../views/template-options'
import '../views/deck-options'
import '../views/card-options'

import {iget, iset, viewparam} from '../data/storage'
import {getCardOptions} from '../data/card-types'

tag upload-page

	prop edd = 'empty-deck-desc'  	
	prop view = 'upload'

	def clickSideBar item		
		const path = "/upload?view={item}"
		view = item
		window.history.pushState({"view":item}, document.title, path)


	def setup
		# Make sure we get default value
		if not iget('default_set')
			const cardTypes = getCardOptions!
			for ct of cardTypes 
				iset(ct.type, ct.default)
			iset('default_set', true)
		view = viewparam() || 'upload'

	def render
		<self[d: block py: 4rem]>
			if window.location.host !== "2anki.net"
				<section .hero .is-small .is-warning>
					<.hero-body .has-text-centered> 
						<p .title> "This is a development server"
						<p> "For the production version see" 
						<a .button href="https://2anki.net"> "https://2anki.net"
						<p> "When reporting bugs, please make sure to share examples."
			<.section>
					<n2a-upload-tabs>
					<.column[max-width: 720px m: 0 auto]>
						switch view
							when 'upload'
								<n2a-upload-form>
							when 'deck-options'
								<deck-options>						
							when 'card-options'
								<card-options>
							when 'template'
								<template-options>