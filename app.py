import datetime as dt
import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from datetime import datetime, timedelta
from flask import Flask, jsonify
from sqlalchemy import extract  
from sqlalchemy import create_engine
import numpy as np
import pandas as pd

#################################################
# Database Setup
#################################################
engine=create_engine("sqlite:///belly_button_biodiversity.sqlite",echo=False)
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

  # print(Base.classes.keys())
# Save reference to the table
Otu=Base.classes.otu
Sample_name=Base.classes.samples
Sample_metadata=Base.classes.samples_metadata
#  print(lenght(all_otu))

# Create our session (link) from Python to the DB
session = Session(engine)

################################################
#Flask Setup
################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"AvailableRoutes:<br/>"
        
        f"/names<br/>"
        f"/otu</br/>"
        f"/metadata/&lt;sample&gt;<br/>"
        f"/wfreq/&lt;sample&gt;<br/>"
        f"/samples/&lt;sample&gt;<end>"
    )


@app.route("/names")
def mysamples():
    sample_names_list = [c.key for c in Sample_name.__table__.columns if c.key!='otu_id']
    print(sample_names_list)
    all_samplenames = list(np.ravel( sample_names_list))
    return jsonify(all_samplenames) 

@app.route("/otu")
def myotu():
    all_otu = session.query(Otu.lowest_taxonomic_unit_found).all()
    all_names = list(np.ravel( all_otu ))
       
    return jsonify(all_names)
@app.route("/metadata/<sample>") 
def metadata(sample):
    sampleid = sample.split('_')[1]
    sample_data=session.query(Sample_metadata).filter(Sample_metadata.SAMPLEID==sampleid).one() 
    metadata_dict={}
    metadata_dict["AGE"]=sample_data.AGE
    metadata_dict["BBTYPE"]=sample_data.BBTYPE
    metadata_dict["ETHNICITY"]=sample_data.ETHNICITY
    metadata_dict["GENDER"]=sample_data.GENDER
    metadata_dict["LOCATION"]=sample_data.LOCATION
    metadata_dict["SAMPLEID"]=sample_data.SAMPLEID      
    return jsonify(metadata_dict)  

@app.route('/wfreq/<sample>')
def weeklydata(sample):
    sample_data=session.query(Sample_metadata.WFREQ).all()
    all_values = list(np.ravel(  sample_data ))
       
    return jsonify(all_values)


@app.route("/samples/<sample>") 
def RetunSampleData(sample):
    sort_values= session.query(Sample_name.otu_id,sample).order_by(sample+" desc").limit(100).all()
    result = [{"otu_id" : [c[0] for c in sort_values],
          "sample_values" : [c[1] for c in sort_values]}]
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
