import '../components/input/locally-stored-checkbox'
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
					<.column .is-one-third>
						<n2a-side-bar[p: 2rem]>
					<.column .is-three-quarters-mobile>
						switch view
							when 'upload'
								<n2a-upload-form>
							when 'deck-options'
								<deck-options>						
							when 'card-options'
								<card-options>
							when 'template'
								<template-options>