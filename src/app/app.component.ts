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


  element: HTMLElement = document.createElement('div');
  parties: Array<string> = new Array<string>();
  numberOfVotes: any = 100000;
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

  generateBallot(): Map<string, string>{
    var ballot = new Map<string,string>();
    var minRank = 1;
    var maxRank = this.parties.length;
    var partiesLocal = this.parties;
    for(var i = minRank; i <= maxRank; i++){
      var partyIndex = Math.floor(Math.random()*(partiesLocal.length))
      ballot.set( i+'', partiesLocal[partyIndex] );
      partiesLocal.splice(partyIndex,1);
    }
    this.setParties();
    return ballot;
  }

  performElectionRound(){
    console.log("Round"+this.round);
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
      this.eliminatedParties.push(lowestVoteCountParty);
      console.log("The following parties have been eliminated: "+this.eliminatedParties);
      
      setTimeout(()=>{
        this.performElectionRound();
      }, 4000)
    }else{
      const finalPartiesArray = Array.from(electionRoundCount.keys());
      finalPartiesArray.forEach(party => {
        var voteCount = electionRoundCount.get(party)!.length;
        var votePercentage = voteCount/this.numberOfVotes*100;
        console.log(party+" received "+voteCount+" votes, which was "+votePercentage+"% of the votes.")
      });
    }
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
