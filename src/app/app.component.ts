import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | undefined;
  public chartOptions: ChartOptions;

  issues:string[] = ["issue1","issue6","issue5","issue4","issue3","issue2"];
  element: HTMLElement = document.createElement('div');
  parties: Array<string> = new Array<string>();
  partiesStandingOnTheIssues: Map<string,Map<string,number>> = new Map<string,Map<string,number>>();
  numberOfVotes: any = 158632;
  round: number = 1;
  minimumViablePercentage: any = 0.2;
  electionBallots:Array<Map<string,string>> = new Array<Map<string,string>>();
  eliminatedParties:Array<string> = new Array<string>();

  constructor( ) {
    this.chartOptions = {
      series: [
        {
          name: "My-series",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      title: {
        text: "Election Results"
      },
      xaxis: {
        categories: ["Blue Party","Red Party", "Green Party","Orange Party","Purple Party","Yellow Party","Pink Party","Brown Party","Burgundy Party"]
      }
    };
  }

  ngOnInit() {
    this.setParties();
    this.setIssues();
    for(var i = 0; i< this.numberOfVotes; i++){
      this.electionBallots.push(this.generateBallot());
    }
    this.performElectionRound()
  }

  setParties(){
    var totalParties = ["Blue Party","Red Party", "Green Party","Orange Party","Purple Party","Yellow Party","Pink Party","Brown Party","Burgundy Party"]
    totalParties.forEach(party => {
      this.parties.push(party)
    });
  }

  setIssues(){
    this.parties.forEach(party => {
      var issuesStandings = new Map<string,number>();
      this.issues.forEach(issue =>{
        var issueStanding = Math.floor(Math.random()*(100-1)+1);
        issuesStandings.set(issue,issueStanding);
      });
      this.partiesStandingOnTheIssues.set(party, issuesStandings);
    });
  }

  generateBallot(): Map<string, string>{
    var ballot = new Map<string,string>();
    var voterInterest = this.generateRandomInterestInIssues();
    var partyMatching = new Map<string,number>();
    this.parties.forEach(party=>{
      partyMatching.set(party,this.compareInterestAndPartyStandings(voterInterest,this.partiesStandingOnTheIssues.get(party)!));
    })
    var minRank = 1;
    var maxRank = this.parties.length;
    var usedParties = new Array<string>();
    for(var i = minRank; i <= maxRank; i++){
      var partyForRank = this.getHighestMatching(partyMatching,usedParties);
      ballot.set(i+'', partyForRank);
      usedParties.push(partyForRank);
    }
    return ballot;
  }

  generateRandomInterestInIssues():Map<string,number>{
    var interests = new Map<string,number>();
    this.issues.forEach(issue=>{
      var issueInterest = Math.floor(Math.random()*(100-1)+1);
      interests.set(issue, issueInterest);
    });
    return interests;
  }

  compareInterestAndPartyStandings(issueInterest:Map<string,number>,partyStandings:Map<string,number>):number{
    var result = 0;
    this.issues.forEach(issue=>{
      result+=Math.abs(partyStandings.get(issue)!-issueInterest.get(issue)!);
    })
    return result;
  }
  
  getHighestMatching(partyMatching:Map<string,number>,usedParties:Array<string>):string{
    var parties = Array.from(partyMatching.keys());
    var unusedParties = parties.filter(party => !usedParties.includes(party));
    var bestMatchingValue = partyMatching.get(unusedParties[0])!;
    var bestMatchingPartyName = unusedParties[0];

    unusedParties.forEach(party => {
      if(partyMatching.get(party)! < bestMatchingValue){
        
        bestMatchingValue = partyMatching.get(party)!;
        bestMatchingPartyName = party;
      }
    });
    return bestMatchingPartyName;
  }

  //ToDO: Create a round tree, where each branch is a different party being eliminated in each round. 
  //Compare the results of the branches to find the quickest route to an election win.
  performElectionRound(){
    console.log("Round "+this.round);
    this.round++;
    var electionRoundCount = this.gatherRankedPlaceBallots(this.electionBallots);
    var lowestVoteCountParty = this.voteCountAndGetPartyWithLowestCount(electionRoundCount, this.eliminatedParties);
    var electionWon = this.checkForWinner(electionRoundCount);
    
    const currentParties = Array.from(electionRoundCount.keys());
    var voteCount = new Array<number>();
    var parties = new Array<string>();
    for(var i = 0; i<currentParties.length; i++){
      voteCount.push(electionRoundCount.get(currentParties[i])!.length);
      parties.push(currentParties[i]);
    }
    this.chartOptions.series =[{
      data: voteCount
    }]
    this.chartOptions.xaxis.categories = parties;
    
    if(!electionWon){
      console.log("The following party was eliminated: "+lowestVoteCountParty);
      this.eliminatedParties.push(lowestVoteCountParty);
      
      setTimeout(()=>{
        this.performElectionRound();
      }, 4000)
    }else{
      console.log("Final Round.")
    }
    const partyRoundTally = Array.from(electionRoundCount.keys());
    partyRoundTally.forEach(party => {
        var voteCount = electionRoundCount.get(party)!.length;
        var votePercentage = Math.floor(voteCount/this.numberOfVotes*100);
        console.log(party+" received "+voteCount+" votes, which was "+votePercentage+"% of the votes.")
    });
  }

  gatherRankedPlaceBallots(ballots:Array<Map<string,string>>): 
  Map<string,Array<Map<string,string>>>{
    var partyVoteCount = new Map<string,Array<Map<string,string>>>();
    this.parties.forEach(party => {
      if(!this.eliminatedParties.includes(party)){
        partyVoteCount.set(party, new Array<Map<string,string>>())
      }
    });
    ballots.forEach(ballot => {
      var realRank = 1;
      var legalPartyFound = false;
      while(!legalPartyFound){
        if(this.eliminatedParties.includes(ballot.get(realRank+'')+'')){
          realRank+=1;
        }else{
          legalPartyFound=true;
        }
      }
      partyVoteCount.get(ballot.get(realRank+'')+'')?.push(ballot);
    });
    return partyVoteCount;
  }

  voteCountAndGetPartyWithLowestCount(ballotsOrganisedByParty:Map<string,Array<Map<string,string>>>, eliminatedParties: Array<string>): string{
    const keysIterator = ballotsOrganisedByParty.keys();
    var lowestVoteCountParty = keysIterator.next().value;
    var lowestVoteCount = ballotsOrganisedByParty.get(lowestVoteCountParty)!.length;

    var highestVoteCountParty =  keysIterator.next().value;
    var highestVoteCount = ballotsOrganisedByParty.get(highestVoteCountParty)!.length;

    this.parties.forEach(party => {

      if( !eliminatedParties.includes(party) && ballotsOrganisedByParty.get(party)!.length < lowestVoteCount ){
        lowestVoteCount = ballotsOrganisedByParty.get(party)!.length;
        lowestVoteCountParty = party;
      }
      if(!eliminatedParties.includes(party) && ballotsOrganisedByParty.get(party)!.length > highestVoteCount){
        highestVoteCount = ballotsOrganisedByParty.get(party)!.length;
        highestVoteCountParty = party;
      }
    });
    return lowestVoteCountParty;
  }

  checkForWinner( ballotsOrganisedByParty:Map<string,Array<Map<string,string>>> ): boolean{
    var winnerFound = false;
    var allPartiesAboveMinimumViablePercentage = true;
    this.parties.forEach(party =>{
      if(!this.eliminatedParties.includes(party)){
          if(ballotsOrganisedByParty.get(party)!.length > this.numberOfVotes*0.5){
            winnerFound = true;
          }else if(ballotsOrganisedByParty.get(party)!.length < this.numberOfVotes * this.minimumViablePercentage){
            allPartiesAboveMinimumViablePercentage = false;
          }
      }
    })
    if(allPartiesAboveMinimumViablePercentage){
      winnerFound = true;
    }
    return winnerFound;
  }

}
