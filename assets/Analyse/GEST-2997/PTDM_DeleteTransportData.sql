-----------------------------------------------------------------------------
-- @Name : PTDM_DeleteTransportData
-- @Desc : Suppression des données d'un transporteur de la base Transport
-----------------------------------------------------------------------------
-- PL 27/05/2016 : ajout de la suppression des données de la table LIGNESHAPE
-- PL 16/06/2016 : abandon de la suppression de LIGNEPERIODE
-- PL 27/10/2016 : ajout de la suppression des données de la table ITISHAPESEGMENT
-- PL 10/03/2017 : évol de la suppression des LIGNESHAPE avec le champ [UPDATEUSER] 
-- PL 10/05/2017 : prise en compte de plusiseurs version de shape lors de la suppression des LIGNESHAPE avec le champ [UPDATEUSER]
-- PL 01/12/2017 : suppression des données de précalcul de la dernière course d'un iti de la journée 
-- PL 02/03/2020 : suppression en lot pour ne pas exploser le LDF + ReduceLog
-----------------------------------------------------------------------------
alter   procedure [dbo].[PTDM_DeleteTransportData]
(	
	@trano numeric
)
as
begin
		--SET ARITHABORT OFF

		-- standards delete
		
		-- PL 02/03/2020 : delete en lot pour ne pas exploser le LDF
		declare @ok bit = 1
		while (@ok = 1)
		begin
			delete top(100000) from Horaire where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
			if @@ROWCOUNT < 1 
				set @ok = 0
		end
		exec PTDM_ReduceLog
						
		set @ok = 1
		while (@ok = 1)
		begin
			delete top(100000) from CourseDate where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
			if @@ROWCOUNT < 1 
				set @ok = 0
		end
		exec PTDM_ReduceLog

		if exists (select * from sysobjects where [name] = 'LASTCOURSEITIDATE' and xtype = 'U')
			delete from LASTCOURSEITIDATE where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
		exec PTDM_ReduceLog

		delete from TdmPeriode where trano= @trano		
		delete from Saison where trano= @trano
		delete from course_periode where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
		delete from course_attribut where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
		delete from course_renvoi where couno in (select couno from Course where tdmno in (select tdmno from TableauMarche where trano = @trano))
		
		exec PTDM_ReduceLog
		
		delete from Course where tdmno in (select tdmno from TableauMarche where trano = @trano)
		delete from TableauMarche where trano= @trano
		exec PTDM_ReduceLog

		-- tables optionnelles		
		
		if exists (select * from sysobjects where [name] = 'ITISHAPE' and xtype = 'U')
			delete ITISHAPE where TRANO = @trano		
		exec PTDM_ReduceLog
			
		-- PL 27/05/2016 : suppression des LIGNESHAPE
		-- PL 10/03/2017 : évol avec le champ [UPDATEUSER]
		if exists (select * from sysobjects where [name] = 'LIGNESHAPE' and xtype = 'U')
		begin
			IF COL_LENGTH('LIGNESHAPE','UPDATEUSER') IS NOT NULL
			begin
				-- on conserve uniquement les shapes avec UPDATEUSER = 1
				delete LIGNESHAPE where ligno in (select ligno from ligne where trano = @trano) and	coalesce(UPDATEUSER, 0) = 0			
				
				-- on détache les shapes de ligne_version (car les données sont supprimées plus bas)
				-- on utilise DATEAPPLICABLE pour stocker temporairement la date de debut de la version
				update ls 
				set ID_LIGNE_VERSION = null, DATEAPPLICABLE = dv.DATE_DEBUT_VALIDITE
				from LIGNESHAPE ls
				inner join LIGNE_VERSION lv on lv.ID_LIGNE_VERSION = ls.ID_LIGNE_VERSION
				inner join LIGNE l on lv.LIGNO = l.LIGNO 
				inner join DATA_VERSION dv on dv.TRANO = l.TRANO and dv.DATE_DEBUT_VALIDITE <= lv.DATE_DEBUT_VALIDITE and lv.DATE_FIN_VALIDITE <= dv.DATE_FIN_VALIDITE
				where l.TRANO = @trano

			end
			else
			begin
				delete LIGNESHAPE where ligno in (select ligno from ligne where trano = @trano)				
			end
		end
		exec PTDM_ReduceLog

		-- PL 27/10/2016 : suppression des ITISHAPESEGMENT
		if exists (select * from sysobjects where [name] = 'ITISHAPESEGMENT' and xtype = 'U')
			delete ITISHAPESEGMENT where itino in (select itino from itineraire where ligno in (select ligno from ligne where trano = @trano))		
		exec PTDM_ReduceLog

		if exists (select * from sysobjects where [name] = 'ItiArret_link' and xtype = 'U')
			truncate table ItiArret_link		
		
		delete from ItiArret where itino in (select itino from itineraire where ligno in (select ligno from ligne where trano = @trano))

		-- 18/11/2013 - Suppression des ITIDISTANCE		
		if exists (select * from sysobjects where [name] = 'ITIDISTANCE' and xtype = 'U')
			delete from ITIDISTANCE where ITINO in (select distinct iti.itino from itineraire iti inner join ligne lig on iti.ligno = lig.ligno where lig.trano = @trano)			
		
		delete from Itineraire where ligno in (select ligno from ligne where trano = @trano)
		delete from LigneArret where ligno in (select ligno from ligne where trano = @trano)
		delete from Ligne_sens where ligno in (select ligno from ligne where trano = @trano)
		delete from Ligne_version where ligno in (select ligno from ligne where trano = @trano)

		delete from pb_du_au where TRANO = @trano

		if exists (select * from sysobjects where [name] = 'RESEAU_EXPLOITANT' and xtype = 'U')
			delete from RESEAU_EXPLOITANT where RESNO in (select resno from ligne where trano = @trano)

		if exists (select * from sysobjects where [name] = 'LIGNE_EXPLOITANT' and xtype = 'U')
			delete from LIGNE_EXPLOITANT where LIGNO in (select ligno from ligne where trano = @trano)

		-- relation pa virtuel
		delete from commune_pointarret where ptano in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)
		delete from correspwalk where ptanoorigine in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)
		delete from correspwalk where ptanodest in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)
		delete from lieupublic_pointarret where pa_id in (select distinct ptano from pointarret where trano =  @trano and ptavirtuel = 1)		

		if exists (select * from sysobjects where [name] = 'ZONEPOINTARRET' and xtype = 'U')
			delete from zonepointarret where PTANO in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)

		-- 18/11/2013 - Suppression des arrêts virtuels dans la table ITISEGMENT 
		if exists (select * from sysobjects where [name] = 'ITISEGMENT' and xtype = 'U')
			delete from ITISEGMENT where PTAORIGINE in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)
														 or PTADEST in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)		
		
		-- 03/04/2014 - Suppression des arrêts virtuels dans la table ARRETTARIFAIRE_POINTARRET
		if exists (select * from sysobjects where [name] = 'ARRETTARIFAIRE_POINTARRET' and xtype = 'U')
			delete from ARRETTARIFAIRE_POINTARRET where PTANO in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)		
		
		-- 13/11/2015 - Suppression des arrêts virtuels dans la table POINTARRET_Geography
		if exists (select * from sysobjects where [name] = 'POINTARRET_Geography' and xtype = 'U')
			delete from POINTARRET_Geography where PTANO in (select distinct ptano from pointarret where trano = @trano and ptavirtuel = 1)		

		-- relation pa virtuel
		delete from pointarret where trano = @trano and ptavirtuel = 1

		exec PTDM_ReduceLog
end
GO

